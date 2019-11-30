uniform sampler2D saturnRingsColorMap;
//uniform vec3 lightPositionUniform;

varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;
varying vec2 Texcoord_V;


void main() {

//    vec3 L = normalize(fragmentPosition - lightPositionUniform );
//    vec3 N = normalize(interpolatedNormal);
//    vec3 V = normalize(cameraPosition - fragmentPosition);
//    vec3 R = normalize(-L + 2.0 * dot(L,N) * N);





	vec4 ambCol = texture2D(saturnRingsColorMap, Texcoord_V);
//	vec3 light_AMB = ambCol.xyz * clamp(dot(-L, N), 0.0, 1.0);
//    vec3 light_DIF = ambCol.xyz * 0.07;
//
//    vec3 TOTAL = light_AMB + light_DIF;
//
//    vec3 TOTAL = vec3(0.0, 0.5, 0.3);

	gl_FragColor = vec4(146.0/255.0, 134.0/255.0, 110.0/255.0,1.0);
//		gl_FragColor = ambCol;

}