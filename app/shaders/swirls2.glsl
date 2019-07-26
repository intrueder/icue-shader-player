uniform vec2 u_resolution;
uniform float u_time;

vec4 hsv_to_rgb(float h, float s, float v, float a)
{
	float c = v * s;
	h = mod((h * 6.0), 6.0);
	float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
	vec4 color;
 
	if (0.0 <= h && h < 1.0) {
		color = vec4(c, x, 0.0, a);
	} else if (1.0 <= h && h < 2.0) {
		color = vec4(x, c, 0.0, a);
	} else if (2.0 <= h && h < 3.0) {
		color = vec4(0.0, c, x, a);
	} else if (3.0 <= h && h < 4.0) {
		color = vec4(0.0, x, c, a);
	} else if (4.0 <= h && h < 5.0) {
		color = vec4(x, 0.0, c, a);
	} else if (5.0 <= h && h < 6.0) {
		color = vec4(c, 0.0, x, a);
	} else {
		color = vec4(0.0, 0.0, 0.0, a);
	}
 
	color.rgb += v - c;
 
	return color;
}

void main()
{
  const float PI = 3.1415926535897932384626433832795;
	float x = gl_FragCoord.x - (u_resolution.x / 2.0);
	float y = gl_FragCoord.y - (u_resolution.y / 2.0);
	
	float r = length(vec2(x,y));
	float angle = atan(x,y) - sin(u_time)*r / 200.0 + 1.0*u_time;
	float intensity = 1.0;//0.5 + 0.25*sin(15.0*angle);
	
	gl_FragColor = hsv_to_rgb(angle/PI, intensity, 1.0, 0.5);
}
