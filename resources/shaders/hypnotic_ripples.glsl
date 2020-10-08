// https://www.shadertoy.com/view/ldX3zr
vec2 center = vec2(0.5,0.5);
float speed = 0.035;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  float invAr = iResolution.y / iResolution.x;

  vec2 uv = fragCoord.xy / iResolution.xy;
  vec3 col = vec3(uv.x,uv.y,0.5+0.5*sin(iTime));

  float x = (center.x-uv.x);
  float y = (center.y-uv.y)*invAr;

  //float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
  float r = -(x*x + y*y);
  float z = 1.0 + 0.5*sin((r+iTime*speed)/0.013);

  vec3 texcol = vec3(z);
  fragColor = vec4(col*texcol,1.0);
}
