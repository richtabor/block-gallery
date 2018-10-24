/**
 * Internal dependencies
 */
import * as helper from './../../utils/helper';
import { LightboxTransforms } from '../../components/lightbox';
import { BackgroundTransforms } from '../../components/background';

/**
 * Set global transforms that every block uses.
 * @type {Object}
 */
function GlobalTransforms( props ) {

	const transforms = {
		align: props.align,
		gutter: props.gutter,
		gutterMobile: props.gutterMobile,
		gridSize: props.gridSize,
		images: props.images.map( ( image ) => helper.pickRelevantMediaFiles( image ) ),
		linkTo: props.linkTo,
		radius: props.radius,
		shadow: props.shadow,
		filter: props.filter,
		height: props.height,
		captionColor: props.captionColor,
		customCaptionColor: props.customCaptionColor,
		...LightboxTransforms( props ),
		...BackgroundTransforms( props ),
	};

	return transforms;
}

export default GlobalTransforms;