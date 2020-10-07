uniform vec2 u_resolution;
uniform float u_time;

// https://www.shadertoy.com/view/lldGzr
void main()
{
  float seed = 0.32; //----------------------------------------------------------starting seed
  const float particles = 18.0; //----------------------------------------------change particle count
  float res = 16.0; //-----------------------------------------------------------pixel resolution
  float gravity = 0.2; //-------------------------------------------------------set gravity
	vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.x;
  uv.y = -uv.y;
  uv.x += 0.25;
   	float clr = 0.0;
    float timecycle = u_time-floor(u_time);  
    seed = (seed+floor(u_time));
    
    //testing
    float invres=1.0/res;
    float invparticles = 1.0/particles;

    
    for( float i=0.0; i<particles; i+=1.0 )
    {
		seed+=i+tan(seed);
        vec2 tPos = (vec2(cos(seed),sin(seed)))*i*invparticles;
        
        vec2 pPos = vec2(0.0,0.0);
        pPos.x=((tPos.x) * timecycle);
		pPos.y = -gravity*(timecycle*timecycle)+tPos.y*timecycle+pPos.y;
        
    	vec2 p1 = pPos;
    	vec4 r1 = vec4(vec2(step(p1,uv)),1.0-vec2(step(p1+invres,uv)));
    	float px1 = r1.x*r1.y*r1.z*r1.w;
	    clr += px1*(sin(u_time*20.0+i)+1.0);
    }
    
	gl_FragColor = vec4(clr*(1.0-timecycle))*vec4(4, 0.5, 0.1,1.0);
}