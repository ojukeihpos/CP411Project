uniform sampler2D earthColorMap;
uniform sampler2D earthNightColorMap;
uniform vec3 lightPositionUniform;
uniform bool noLight;

varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;
varying vec2 Texcoord_V;


void main() {

    vec3 L = normalize(fragmentPosition - lightPositionUniform );
    vec3 N = normalize(interpolatedNormal);
    vec3 V = normalize(cameraPosition - fragmentPosition);



    vec3 atmosphereCol = vec3(11.0/255.0,146.0/255.0,242.0/255.0);
    float atmosphereAngle = pow(clamp(dot(N, V),0.0,1.0),0.2);


    vec4 ambCol;
    vec3 light_AMB;
    if (dot(-L,N)<0.0){
         ambCol = texture2D(earthNightColorMap, Texcoord_V);
        light_AMB = ambCol.xyz * clamp(dot(L, N), 0.0, 1.0)*1.5;
    } else {
        ambCol = texture2D(earthColorMap, Texcoord_V);
	     light_AMB = ambCol.xyz * clamp(dot(-L, N), 0.0, 1.0);

    }
    vec3 light_DIF = ambCol.xyz * 0.07;
    vec3 TOTAL;
    if (noLight) {
        TOTAL = texture2D(earthColorMap, Texcoord_V).xyz;
    } else {
        TOTAL = light_AMB + light_DIF;
        TOTAL = mix(TOTAL, atmosphereCol, 1.0-atmosphereAngle);
    }

	gl_FragColor = vec4(TOTAL, 1.0);
}
