#!/usr/bin/env python3
"""Optional native Mesa/EGL pixel regression; no browser, packages or network required.
Run: python scripts/check-webgl-heat.py
Compiles the shipped WebGL shaders and draws its real generated meshes on an ES2 pbuffer.
"""
import ctypes as C
import ctypes.util
import json
from pathlib import Path
import subprocess
import tempfile

E = C.CDLL(ctypes.util.find_library('EGL') or 'libEGL.so.1')
E.eglGetProcAddress.argtypes = [C.c_char_p]
E.eglGetProcAddress.restype = C.c_void_p

def egl(name, result, args):
    f = getattr(E, name); f.restype = result; f.argtypes = args; return f

def gl(name, result, args):
    p = E.eglGetProcAddress(name.encode()); assert p, name
    return C.CFUNCTYPE(result, *args)(p)

I, U, F, P = C.c_int, C.c_uint, C.c_float, C.c_void_p
platform = C.CFUNCTYPE(P, U, P, C.POINTER(I))(E.eglGetProcAddress(b'eglGetPlatformDisplayEXT'))
display = platform(0x31DD, None, None)  # EGL_PLATFORM_SURFACELESS_MESA
assert egl('eglInitialize', U, [P, C.POINTER(I), C.POINTER(I)])(display, C.byref(I()), C.byref(I()))
assert egl('eglBindAPI', U, [U])(0x30A0)  # EGL_OPENGL_ES_API
attrs = (I * 17)(0x3033, 1, 0x3040, 4, 0x3024, 8, 0x3023, 8, 0x3022, 8, 0x3021, 8, 0x3025, 16, 0x3038, 0x3038, 0x3038)
config, count = P(), I()
assert egl('eglChooseConfig', U, [P, C.POINTER(I), C.POINTER(P), I, C.POINTER(I)])(display, attrs, C.byref(config), 1, C.byref(count)) and count.value
context = egl('eglCreateContext', P, [P, P, P, C.POINTER(I)])(display, config, None, (I * 3)(0x3098, 2, 0x3038))
assert context
create_surface = egl('eglCreatePbufferSurface', P, [P, P, C.POINTER(I)])
make_current = egl('eglMakeCurrent', U, [P, P, P, P])

with tempfile.TemporaryDirectory(prefix='armok-heat-') as folder:
    root = Path(__file__).resolve().parents[1]
    subprocess.run(['node', str(root / 'tests/webgl-heat-fixture.mjs'), folder], check=True)
    scene = json.loads((Path(folder) / 'scene.json').read_text())
    w, h = scene['width'], scene['height']
    surface = create_surface(display, config, (I * 5)(0x3057, w, 0x3056, h, 0x3038))
    assert surface and make_current(display, surface, surface, context)
    shader_new = gl('glCreateShader', U, [U]); shader_source = gl('glShaderSource', None, [U, I, C.POINTER(C.c_char_p), C.POINTER(I)])
    compile_shader = gl('glCompileShader', None, [U]); shader_status = gl('glGetShaderiv', None, [U, U, C.POINTER(I)])
    shader_log = gl('glGetShaderInfoLog', None, [U, I, C.POINTER(I), P])
    program = gl('glCreateProgram', U, [])()
    for kind, text in scene['shaders'].items():
        shader = shader_new(0x8B31 if kind == 'VERTEX_SHADER' else 0x8B30)
        encoded = C.c_char_p(text.encode()); shader_source(shader, 1, C.byref(encoded), None); compile_shader(shader)
        ok = I(); shader_status(shader, 0x8B81, C.byref(ok))
        log = C.create_string_buffer(4096); shader_log(shader, 4096, None, log)
        assert ok.value, log.value.decode()
        gl('glAttachShader', None, [U, U])(program, shader)
    gl('glLinkProgram', None, [U])(program)
    ok = I(); gl('glGetProgramiv', None, [U, U, C.POINTER(I)])(program, 0x8B82, C.byref(ok)); assert ok.value, 'Shader link failed'
    gl('glUseProgram', None, [U])(program)
    loc = gl('glGetUniformLocation', I, [U, C.c_char_p])
    uniform_i = gl('glUniform1i', None, [I, I]); uniform_f = gl('glUniform1f', None, [I, F])
    uniform_i(loc(program, b'uPicking'), 0); uniform_f(loc(program, b'uPointSize'), 11)
    matrix_uniform = loc(program, b'uMatrix')
    inner_uniform = loc(program, b'uMarkerInnerRadius')
    attr = gl('glGetAttribLocation', I, [U, C.c_char_p])
    attrs = [attr(program, n) for n in [b'aPosition', b'aColor', b'aPick']]
    bind = gl('glBindBuffer', None, [U, U]); buffers = {}
    for name in ['land', 'heat', 'marker']:
        data = (Path(folder) / (name + '.bin')).read_bytes(); buf = U()
        gl('glGenBuffers', None, [I, C.POINTER(U)])(1, C.byref(buf)); bind(0x8892, buf.value)
        array = C.create_string_buffer(data)
        gl('glBufferData', None, [U, C.c_ssize_t, P, U])(0x8892, len(data), array, 0x88E4)
        buffers[name] = (buf.value, len(data) // 40)
    enable = gl('glEnable', None, [U]); disable = gl('glDisable', None, [U]); depth_mask = gl('glDepthMask', None, [C.c_ubyte])
    draw_arrays = gl('glDrawArrays', None, [U, I, I]); pointer = gl('glVertexAttribPointer', None, [U, I, U, C.c_ubyte, I, P])
    def draw(name):
        buf, count = buffers[name]; bind(0x8892, buf)
        for at, size, offset in zip(attrs, [3, 4, 3], [0, 12, 28]):
            if at >= 0:
                gl('glEnableVertexAttribArray', None, [U])(at); pointer(at, size, 0x1406, 0, 40, P(offset))
        uniform_i(loc(program, b'uPoints'), int(name == 'marker'))
        draw_arrays(0 if name == 'marker' else 4, 0, count)
    def render(frame, heat, hollow, picking=False):
        gl('glViewport', None, [I, I, I, I])(0, 0, w, h)
        uniform_i(loc(program, b'uPicking'), int(picking))
        uniform_f(inner_uniform, hollow)
        gl('glUniformMatrix4fv', None, [I, I, C.c_ubyte, C.POINTER(F)])(matrix_uniform, 1, 0, (F * 16)(*frame['matrix']))
        enable(0x0B71); gl('glDepthFunc', None, [U])(0x0203); disable(0x0B44); disable(0x0BD0); depth_mask(1); disable(0x0BE2)
        gl('glClearColor', None, [F, F, F, F])(.09, .14, .16, 1); gl('glClear', None, [U])(0x4000 | 0x0100)
        draw('land'); enable(0x0BE2); gl('glBlendFunc', None, [U, U])(0x0302, 0x0303); depth_mask(0)
        if heat:
            enable(0x8037); gl('glPolygonOffset', None, [F, F])(-1, -1); draw('heat'); disable(0x8037)
        draw('marker'); depth_mask(1); disable(0x0BE2)
        pixel = (C.c_ubyte * 4)(); gl('glReadPixels', None, [I, I, I, I, U, U, P])(frame['x'], frame['y'], 1, 1, 0x1908, 0x1401, pixel)
        error = gl('glGetError', U, [])(); assert not error, hex(error)
        return list(pixel)
    for frame in scene['frames']:
        solid = render(frame, True, 0)
        hollow = render(frame, True, scene['innerRadius'])
        off = render(frame, False, 0)
        assert solid[2] > solid[0] + 100, ('Expected reproduction: marker covers heat', frame['yaw'], solid)
        assert hollow[0] > hollow[2] + 100, ('Heat hidden beneath marker', frame['yaw'], hollow)
        assert off[2] > off[0] + 100, ('Heat toggle did not restore marker', off)
        print(f"PASS yaw {frame['yaw']}: covered {solid}, visible heat {hollow}, off {off}")
    assert inner_uniform >= 0, 'Shipped shader has no hollow heat-marker support'
    make_current(display, None, None, None)
    egl('eglDestroySurface', U, [P, P])(display, surface)
egl('eglDestroyContext', U, [P, P])(display, context)
egl('eglTerminate', U, [P])(display)
