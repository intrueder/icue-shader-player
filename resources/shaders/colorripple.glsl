uniform vec2 u_resolution;
uniform float u_time;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float GetFog(vec2 pos, float seed)
{
    float k = noise (pos + vec2(u_time));
    float j = noise(pos + k);
    float n = noise(pos + j + seed);
    
    return n;
}

void main()
{
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float aspectRatio = u_resolution.x / u_resolution.y;

    // Center
    st.x *= aspectRatio;
    st.x -= .5 * aspectRatio;
    st.y -= .5;
    
    // Subtle Camera Movement
    //float tx = noise(vec2(u_time + 15.)) - .5;
    //float ty = noise(vec2(u_time)) - .5;
    //st += vec2(tx, ty)/12.;
    
    float dst = 1.-distance(st,vec2(0)) + sin(u_time)*.01;
    st*=dst;
    
    // Zoom
    st *= 2.5 + sin(dst*50. + u_time*5.);

    // Scale the coordinate system to see
    // some noise in action
    vec2 pos = vec2(st*0.5);

    // Use the noise function
    float n = max(GetFog(pos, 100.), GetFog(pos, 0.));

    //vec3 color = mix(vec3(0,0,0), vec3(1., 0, 0), n);
    
    // Color It In
    vec3 col = 0.9 + 0.5*sin(u_time*2.5 + vec3(0,2,4));
    vec3 col2 = 0.9 + 0.5*sin(u_time*2.5 + vec3(0,2,4) + .5);
    vec3 color = clamp(mix(col, col2-.9, n), 0, 1);
    gl_FragColor = vec4(color, 1.0);
}