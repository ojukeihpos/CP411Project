varying vec2 Texcoord_V;
varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;

void main() {
	Texcoord_V = uv;

    interpolatedNormal = (modelMatrix*vec4(normal, 1.0)).xyz;
    fragmentPosition = (modelMatrix*vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}