#version 300 es
precision highp float;
// Port of dg01-video filtros.py preset "sombrio" (eq=brightness=-0.03:
// contrast=1.12:saturation=0.82, colorbalance=rs=-0.08:gs=-0.02:bs=0.10) —
// horror/suspense genre grade: desaturated, cold shadows. Approximate GLSL
// equivalent, not a bit-exact ffmpeg eq/colorbalance replication.
uniform sampler2D u_input;
uniform float u_intensity;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_coolShadows;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 src = texture(u_input, v_texCoord);
  vec3 c = src.rgb;
  c = (c - 0.5) * u_contrast + 0.5 - 0.03;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(lum), c, u_saturation);
  // colorbalance rs/gs/bs targets shadows: weight the shift by how dark the pixel is.
  float shadowWeight = 1.0 - smoothstep(0.0, 0.5, lum);
  c += vec3(-0.08, -0.02, 0.10) * u_coolShadows * shadowWeight;
  c = clamp(c, 0.0, 1.0);
  fragColor = vec4(mix(src.rgb, c, clamp(u_intensity, 0.0, 1.0)), src.a);
}
