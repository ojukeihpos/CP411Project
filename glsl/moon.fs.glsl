uniform sampler2D moonColorMap;
uniform vec3 lightPositionUniform;
uniform bool noLight;

varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;
varying vec2 Texcoord_V;

void main() {

    vec3 L = normalize(fragmentPosition - lightPositionUniform );
    vec3 N = normalize(interpolatedNormal);
    vec3 V = normalize(cameraPosition - fragmentPosition);

	vec4 ambCol = texture2D(moonColorMap, Texcoord_V);
	vec3 light_AMB = ambCol.xyz * clamp(dot(-L, N), 0.0, 1.0);
    vec3 light_DIF = ambCol.xyz * 0.07;

    vec3 TOTAL;
    if (noLight) {
        TOTAL = ambCol.xyz;
    } else {
        TOTAL = light_AMB + light_DIF;
    }

	gl_FragColor = vec4(TOTAL, 1.0);
}
