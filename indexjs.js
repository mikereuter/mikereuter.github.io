// Declaring global variables
var canvas;
var gl;
var program;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// Defining the cubes 8 corners/vertices
var cubeVertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

// Assigning solid colors to each 6 faces of the cube
var cubeColors = [
    vec4(0.0, 0.0, 1.0, 1.0), //Blue
    vec4(0.0, 1.0, 1.0, 1.0), //Cyan
    vec4(1.0, 1.0, 0.0, 1.0), //Yellow
    vec4(0.0, 1.0, 0.0, 1.0), //Green
    vec4(1.0, 0.0, 0.0, 1.0), //Red
    vec4(1.0, 0.0, 1.0, 1.0), //Pink
];

// Defining vertex indices using 2 triangles to create each "face" of our cube
var cubeIndices = [
    0, 1, 2, 0, 2, 3, // Front face (1st Triangle = 0,1,2 | 2nd Triangle = 0,2,3) etc. for all faces.
    4, 5, 6, 4, 6, 7, // Back face (2 Triangles, etc.)
    1, 5, 6, 1, 6, 2, // Right face
    0, 4, 7, 0, 7, 3, // Left face
    3, 2, 6, 3, 6, 7, // Top face
    0, 1, 5, 0, 5, 4  // Bottom face
];

// Initializing the angle for rotation to be "incremented/updated" in each frame, giving us the "spinning" animation
var angle = 0;

// Getting the WebGL context for our canvas
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl');
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Setting canvas clear color at the beginning of each frame
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Set up initial camera position and perspective for the 3D scene using modelViewMatrix and projectionMatrix
    modelViewMatrix = lookAt(vec3(1, 1, 2), vec3(0, 0, 0), vec3(0, 1, 0));
    projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 10.0);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Creating and initializing new VERTEX buffer object and loading the data into GPU using flatten().
    var cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer, as with our Sierpinski Gasket
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Same as above, but creating and initializing new COLOR buffer object and loading the data into GPU
    var cubeColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColors), gl.STATIC_DRAW);

    // Creating and initializing new buffer object for cube indices and loading the data into GPU
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    // Getting/updating uniform locations and matrices for modelViewMatrix and projectionMatrix
    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
    projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');

    // Enable depth testing to prevent overlapping geometry/visual issues.
    gl.enable(gl.DEPTH_TEST);

    // Starting the rendering loop
    render();
};

// Rendering loop
function render() {
    // Clear color and depth buffers for the next frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Applying Transformations to give us the "spinning" animation
    angle += 0.40;    // Incrementing rotation angle "0.40" units for each frame update

    // Calculating rotation matrix to rotate around the "Y" axis for each frame, by each "angle" increment
    var rotationMatrix = rotate(angle, vec3(0, 1, 0));
    modelViewMatrix = mult(lookAt(vec3(1, 1, 2), vec3(0, 0, 0), vec3(0, 1, 0)), rotationMatrix);

    // Updating the Uniform Values of our modelViewMatrix/projectionMatrix in our shader
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Issuing draw calls
    // Iterating over elements/colors in the "cubeColors" array to set face color value in fragment-shader
    for (var i = 0; i < cubeColors.length; i++) {
        // Getting the uniform location and setting the value of "uColor" to the current face
        var uColorLoc = gl.getUniformLocation(program, 'uColor');
        gl.uniform4fv(uColorLoc, cubeColors[i]);

        // Draw/Render the cube faces with index buffer offset(i * 6 * 2),
        // i=face to draw, 6=2Triangles*3Vertices, and 2=bytes per index because of the gl.UNSIGNED_SHORT)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, i * 6 * 2);
    }

    // Requesting next frame to render/rotate our 3D cube
    requestAnimationFrame(render);
}
