// @ts-nocheck
// Vendored, unmodified from three.js examples/jsm (v0.128.0), MIT licensed.
// Source: https://github.com/mrdoob/three.js/tree/r128/examples/jsm — see src/vendor/three-jsm/LICENSE.
// The project's build (esbuild --bundle) resolves this file's `from 'three'`
// imports against the real npm `three` package, which is bundled directly
// into the shipped card output alongside the rest of this addon.
/**
 * Full-screen textured quad shader
 */

var CopyShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;

		}`

};

export { CopyShader };
