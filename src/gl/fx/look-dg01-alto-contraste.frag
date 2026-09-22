#version 300 es
precision highp float;
// Port of dg01-video filtros.py preset "alto_contraste" (eq=contrast=1.25:
// saturation=1.12) — competitive/FPS genre grade: crisp, no color cast.
// Approximate GLSL equivalent, not a bit-exact ffmpeg eq replication.
uniform sampler2D u_input;
uniform float u_intensity;
uniform float u_contrast;
uniform float u_saturation;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 src = texture(u_input, v_texCoord);
  vec3 c = src.rgb;
  c = (c - 0.5) * u_contrast + 0.5;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(lum), c, u_saturation);
  c = clamp(c, 0.0, 1.0);
  fragColor = vec4(mix(src.rgb, c, clamp(u_intensity, 0.0, 1.0)), src.a);
}
