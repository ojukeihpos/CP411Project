varying vec2 Texcoord_V;
uniform vec3 earthPosition;
uniform vec3 marsPosition;
uniform vec3 venusPosition;
uniform vec3 mercuryPosition;
uniform float randNoise;
uniform sampler2D sunColorMap;

varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}


void main() {

    vec3 N = normalize(interpolatedNormal);
    vec3 V = normalize(cameraPosition - fragmentPosition);



    vec3 atmosphereCol = vec3(255.0/255.0,119.0/255.0,0.0/255.0);
    float atmosphereAngle = pow(clamp(dot(N, V),0.0,1.0),0.4);

//    vec2 st = (earthPosition.xz+marsPosition.zx+venusPosition.xz+mercuryPosition.zx)/texture2D(sunColorMap, Texcoord_V).yx;
    vec2 st =texture2D(sunColorMap, Texcoord_V).yx/(earthPosition.xz+marsPosition.zx-venusPosition.xz+mercuryPosition.zx);

    vec2 st2 =texture2D(sunColorMap, Texcoord_V).xy/(earthPosition.zx-marsPosition.xz-venusPosition.xx-mercuryPosition.zx);
    float rnd = random( st );
    float rnd2 = random(st2);

	vec4 ambCol = texture2D(sunColorMap, Texcoord_V);
	vec3 light_AMB = ambCol.xyz;

//    float randomNumber = (rand() % 2);
    vec3 TOTAL = light_AMB*0.9+vec3(255.0/255.0,119.0/255.0,0.0/255.0)*0.2*(rnd)-vec3(255.0/255.0,119.0/255.0,0.0/255.0)*0.2*(rnd2);
//    TOTAL = mix(TOTAL, atmosphereCol, 1.0-atmosphereAngle);

	gl_FragColor = vec4(TOTAL, 1.0);
}
