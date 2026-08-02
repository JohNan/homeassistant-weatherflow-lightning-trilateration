// @ts-nocheck
// Vendored, unmodified from three.js examples/jsm (v0.128.0), MIT licensed.
// Source: https://github.com/mrdoob/three.js/tree/r128/examples/jsm — see src/vendor/three-jsm/LICENSE.
// The project's build (esbuild --bundle) resolves this file's `from 'three'`
// imports against the real npm `three` package, which is bundled directly
// into the shipped card output alongside the rest of this addon.
import {
	BufferGeometry,
	Float32BufferAttribute,
	OrthographicCamera,
	Mesh
} from 'three';

class Pass {

	constructor() {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	}

	setSize( /* width, height */ ) {}

	render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
_geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class FullScreenQuad {

	constructor( material ) {

		this._mesh = new Mesh( _geometry, material );

	}

	dispose() {

		this._mesh.geometry.dispose();

	}

	render( renderer ) {

		renderer.render( this._mesh, _camera );

	}

	get material() {

		return this._mesh.material;

	}

	set material( value ) {

		this._mesh.material = value;

	}

}

export { Pass, FullScreenQuad };
