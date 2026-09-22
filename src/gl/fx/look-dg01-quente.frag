#version 300 es
precision highp float;
// Port of dg01-video filtros.py preset "quente" (colorbalance=rs=0.08:
// gs=0.02:bs=-0.10, eq=saturation=1.08) — cozy/exploration genre grade:
// warm shadows. Not wired to any genre profile in dg01-video yet (reserved
// preset in filtros.CATALOGO). Approximate GLSL equivalent, not a
// bit-exact ffmpeg colorbalance/eq replication.
uniform sampler2D u_input;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_warmShadows;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 src = texture(u_input, v_texCoord);
  vec3 c = src.rgb;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  // colorbalance rs/gs/bs targets shadows: weight the shift by how dark the pixel is.
  float shadowWeight = 1.0 - smoothstep(0.0, 0.5, lum);
  c += vec3(0.08, 0.02, -0.10) * u_warmShadows * shadowWeight;
  float lum2 = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(lum2), c, u_saturation);
  c = clamp(c, 0.0, 1.0);
  fragColor = vec4(mix(src.rgb, c, clamp(u_intensity, 0.0, 1.0)), src.a);
}
