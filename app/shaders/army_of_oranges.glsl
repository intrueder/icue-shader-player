uniform vec2 u_resolution;
uniform float u_time;

// https://www.shadertoy.com/view/XdGGRz

float map(vec3 p){
    p.x = mod(p.x, 2.0);
    p.y = mod(p.y, 2.0);
    p.z = mod(p.z, 2.0);
    return length(p-vec3(1.0,1.0,1.0)) - 0.5;
}

float trace(vec3 o, vec3 r){
    float t = 0.5;
    const int maxSteps = 32;
    for (int i = 0; i < maxSteps; i++){ 
        vec3 p = o + r * t;
        float d = map(p);
        t += d * 1.0*(sin(u_time));
    }
    return t;
}

void main()
{
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv*2.0 -1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    vec3 r = normalize(vec3(uv, 1.0));
    
    vec3 o = vec3(0.0,0.0,-3.0);
    o.z = 2.6*u_time;
    
    
    float t = trace(o,r);
    float fog = 1.0 / (1.0 + t * t * 0.1);
    vec3 fc = vec3(fog);
    
  gl_FragColor = vec4(fc*vec3(2.0,1.0,0.05),1.0);
}