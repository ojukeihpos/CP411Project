varying vec3 Texcoord_V;

void main()
{

	Texcoord_V = vec3(position.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + cameraPosition, 1.0);

    gl_Position = gl_Position.xyww;

}