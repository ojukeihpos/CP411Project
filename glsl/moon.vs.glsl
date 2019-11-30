varying vec3 interpolatedNormal;
varying vec3 fragmentPosition;

varying vec2 Texcoord_V;

uniform vec3 earthPosition;
uniform vec3 moonPosition;
uniform vec3 lightPositionUniform;
uniform vec3 moonRotation;
void main() {

    vec3 move = moonPosition;
    vec3 moveInit = earthPosition;



	Texcoord_V = uv;

    float angle = moonRotation.y;

   mat4 rotateY = mat4(cos(angle),  0.0, -sin(angle), 0.0,
                       0.0,         1.0, 0.0,        0.0,
                       sin(angle), 0.0, cos(angle), 0.0,
                       0.0,         0.0, 0.0,        1.0);

    mat4 moveMat = mat4(1.0, 0.0, 0.0, 0.0,
                         0.0, 1.0, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         move.x, move.y, move.z, 1.0);

 mat4 moveMatInit = mat4(1.0, 0.0, 0.0, 0.0,
                          0.0, 1.0, 0.0, 0.0,
                          0.0, 0.0, 1.0, 0.0,
                          moveInit.x, moveInit.y, moveInit.z, 1.0);

    interpolatedNormal = (modelMatrix *rotateY*vec4(normal, 1.0)).xyz;
//    fragmentPosition = (modelMatrix*vec4(position+earthPosition, 1.0)).xyz;
    fragmentPosition = (modelMatrix*moveMat* moveMatInit*rotateY*vec4(position, 1.0)).xyz;

//    interpolatedNormal = (modelViewMatrix*moveMat* rotateMat *vec4(normal, 1.0)).xyz;
//     fragmentPosition = (modelViewMatrix*moveMat* rotateMat *vec4(position, 1.0)).xyz;

//    gl_Position = projectionMatrix * modelViewMatrix  * vec4(position+earthPosition, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * moveMat * moveMatInit*rotateY* vec4(position, 1.0);


}