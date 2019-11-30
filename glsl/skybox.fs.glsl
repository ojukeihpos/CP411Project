// UNIFORMS
uniform samplerCube skybox;
varying vec3 Texcoord_V;

void main() {

    gl_FragColor = textureCube(skybox, Texcoord_V);
//    gl_FragColor = vec4(0.2,0.5,0.5,1.0);
}