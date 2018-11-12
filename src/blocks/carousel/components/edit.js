/**
 * External dependencies
 */
import classnames from 'classnames';
import filter from 'lodash/filter';
import Flickity from 'react-flickity-component';

/**
 * Internal dependencies
 */
import GalleryImage from '../../../components/gallery-image';
import GalleryPlaceholder from '../../../components/gallery-placeholder';
import GalleryDropZone from '../../../components/gallery-dropzone';
import GalleryUpload from '../../../components/gallery-upload';
import Inspector from './inspector';
import { BackgroundStyles } from '../../../components/background/';
import { title, icon } from '../'
import { GlobalClasses, GlobalToolbar } from '../../../components/global/';

/**
 * WordPress dependencies
 */
const { __, sprintf } = wp.i18n;
const { Component, Fragment } = wp.element;
const { compose } = wp.compose;
const { withSelect } = wp.data;
const { withNotices, ResizableBox } = wp.components;
const { withColors, RichText } = wp.editor;

/**
 * Block consts.
 */
const flickityOptions = {
	draggable: false,
	pageDots: true,
	prevNextButtons: true,
	wrapAround: true,
	autoPlay: false,
	arrowShape: {
		x0: 10,
		x1: 60, y1: 50,
		x2: 65, y2: 45,
		x3: 20
	},
}

/**
 * Block edit function
 */
class Edit extends Component {
	constructor() {
		super( ...arguments );

		this.onSelectImage = this.onSelectImage.bind( this );
		this.onRemoveImage = this.onRemoveImage.bind( this );
		this.setImageAttributes = this.setImageAttributes.bind( this );
		this.onFocusCaption = this.onFocusCaption.bind( this );
		this.onItemClick = this.onItemClick.bind( this );

		this.state = {
			selectedImage: null,
			captionFocused: false,
		};
	}

	componentDidMount() {

		// This block does not support the following attributes.
		this.props.setAttributes( {
			lightbox: undefined,
			lightboxStyle: undefined,
			shadow: undefined,
		} );
	}

	componentDidUpdate( prevProps ) {

		// Deselect images when deselecting the block.
		if ( ! this.props.isSelected && prevProps.isSelected ) {
			this.setState( {
				selectedImage: null,
				captionSelected: false,
				captionFocused: false,
			} );
		}

		if ( ! this.props.isSelected && prevProps.isSelected && this.state.captionFocused ) {
			this.setState( {
				captionFocused: false,
			} );
		}

		if ( this.props.attributes.gutter <= 0 ) {
			this.props.setAttributes( {
				radius: 0,
			} );
		}

		if ( this.props.attributes.gridSize == 'xlrg' && prevProps.attributes.align == undefined ) {
			this.props.setAttributes( {
				gutter: 0,
				gutterMobile: 0,
			} );
		}
	}

	onSelectImage( index ) {
		return () => {
			if ( this.state.selectedImage !== index ) {
				this.setState( {
					selectedImage: index,
					captionFocused: false,
				} );
			}
		};
	}

	onRemoveImage( index ) {
		return () => {
			const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
			const { gridSize } = this.props.attributes;
			this.setState( { selectedImage: null } );
			this.props.setAttributes( {
				images,
			} );
		};
	}

	setImageAttributes( index, attributes ) {
		const { attributes: { images }, setAttributes } = this.props;
		if ( ! images[ index ] ) {
			return;
		}
		setAttributes( {
			images: [
				...images.slice( 0, index ),
				{
					...images[ index ],
					...attributes,
				},
				...images.slice( index + 1 ),
			],
		} );
	}

	onFocusCaption() {
		if ( ! this.state.captionFocused ) {
			this.setState( {
				captionFocused: true,
			} );
		}
	}

	onItemClick() {
		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}

		if ( this.state.captionFocused ) {
			this.setState( {
				captionFocused: false,
			} );
		}
	}

	render() {
		const {
			attributes,
			backgroundColor,
			className,
			isSelected,
			noticeOperations,
			noticeUI,
			setAttributes,
			toggleSelection,
			captionColor,
		} = this.props;

		const {
			align,
			autoPlay,
			gridSize,
			gutter,
			gutterMobile,
			height,
			images,
			pageDots,
			prevNextButtons,
			primaryCaption,
			autoPlaySpeed,
		} = attributes;

		const dropZone = (
			<GalleryDropZone
				{ ...this.props }
				label={ sprintf( __( 'Drop to add to the %s' ), title.toLowerCase() ) }
			/>
		);

		const wrapperClasses = classnames(
			'is-cropped',
			...GlobalClasses( attributes ), {
				[ `align${ align }` ] : align,
				[ `has-horizontal-gutter` ] : gutter > 0,
				[ `has-no-dots` ] : ! pageDots,
				[ `has-no-arrows` ] : ! prevNextButtons,
				'is-selected': isSelected,

			}
		);

		const wrapperStyles = {
			...BackgroundStyles( attributes ),
			backgroundColor: backgroundColor.color,
			'is-selected': isSelected,
		};

		const captionStyles = {
			color: captionColor.color,
		};

		const flickityClasses = classnames(
			'has-carousel',
			`has-carousel-${ gridSize }`, {}
		);

		if ( images.length === 0 ) {
			return (
				<GalleryPlaceholder
					{ ...this.props }
					label={ sprintf( __( '%s Gallery' ), title ) }
					icon={ icon }
				/>
			);
		}

		return (
			<Fragment>
				<GlobalToolbar
					{ ...this.props }
				/>
				<Inspector
					{ ...this.props }
				/>
				{ noticeUI }
				<ResizableBox
						size={ {
							height: height,
							width: '100%',
						} }
						className={ classnames(
							{ 'is-selected': isSelected }
						) }
						minHeight="200"
						enable={ {
							bottom: true,
							bottomLeft: false,
							bottomRight: false,
							left: false,
							right: false,
							top: false,
							topLeft: false,
							topRight: false,
						} }
						onResizeStop={ ( event, direction, elt, delta ) => {
							setAttributes( {
								height: parseInt( height + delta.height, 10 ),
							} );
							toggleSelection( true );
						} }
						onResizeStart={ () => {
							toggleSelection( false );
						} }
					>
					{ dropZone }
					<div className={ className }>
						<div
							className={ wrapperClasses }
							style={ wrapperStyles }
						>
							<Flickity
								className={ flickityClasses }
								options={ flickityOptions }
								disableImagesLoaded={ false }
								updateOnEachImageLoad={ true }
								reloadOnUpdate={ true }
								flickityRef={ c => this.flkty = c }
							>
								{ images.map( ( img, index ) => {
									/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
									const ariaLabel = __( sprintf( 'image %1$d of %2$d in gallery', ( index + 1 ), images.length ) );

									return (
										<div className="blockgallery--item" key={ img.id || img.url } onClick={ this.onItemClick }>
											<GalleryImage
												url={ img.url }
												alt={ img.alt }
												id={ img.id }
												gutter={ gutter }
												gutterMobile={ gutterMobile }
												marginRight={ true }
												marginLeft={ true }
												isSelected={ isSelected && this.state.selectedImage === index }
												onRemove={ this.onRemoveImage( index ) }
												onSelect={ this.onSelectImage( index ) }
												setAttributes={ ( attrs ) => this.setImageAttributes( index, attrs ) }
												caption={ img.caption }
												aria-label={ ariaLabel }
												supportsCaption={ false }
											/>
										</div>
									);
								} ) }
								<GalleryUpload { ...this.props }
									gutter={ gutter }
									gutterMobile={ gutterMobile }
									marginRight={ true }
									marginLeft={ true }
								/>
							</Flickity>
						</div>
					</div>
				</ResizableBox>
				{ ( ! RichText.isEmpty( primaryCaption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ primaryCaption }
						className="blockgallery--caption blockgallery--primary-caption"
						style={ captionStyles }
						unstableOnFocus={ this.onFocusCaption }
						onChange={ ( value ) => setAttributes( { primaryCaption: value } ) }
						isSelected={ this.state.captionFocused }
						keepPlaceholderOnFocus
						inlineToolbar
					/>
				) }
			</Fragment>
		);
	}
}

export default compose( [
	withColors( { backgroundColor : 'background-color', captionColor : 'color' } ),
	withNotices,
] )( Edit );