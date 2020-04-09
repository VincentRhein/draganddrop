var dragimages = document.querySelectorAll( 'img.dragme' );	// All images that should be draggable

var dragimage = false;  // Contains a reference to the dragging image is stored (set to 'FALSE' if none)
var zindex = 1;		    // Stores the current highest z-index

var zoomfactor = 1.2;   // Zoomfactor for dragged images
var resetspeed = '.2s'; // Speed in which elements slide back to their initial positions on resize

function getImageOffset( image ) {

	// We move the images around updating the CSS-transform property, therefor we need to 
	// convert this value into numbers for the script to understand the "real" coordinates
	
	var offset = image.style.transform.split( 'px, ' );
	
	var offsetx = parseFloat( offset[ 0 ].split( 'translate3d(' ).pop( ) ),
		offsety = parseFloat( offset[ 1 ].split( ',' ).shift( ) );
	
	return { x: offsetx, y: offsety };
}

function activateDragImage( ) {
	var image = this;
	
	// Show and reactivate the cursor
	image.style[ 'pointer-events' ] = '';
	image.style[ 'opacity' ] = 1;
	
	// Assign a random offset no more than 50% of the image width 
	// from the actual position to make the grid look less sterile 
	image.style[ 'left' ] = ( Math.random( ) * 10 - 5 ) + 'vw';
	image.style[ 'top' ] = ( Math.random( ) * 10 - 5 ) + 'vw';
	
	// Add mouse and touch behaviour which initiates the dragging
	image.addEventListener( 'mousedown', startDragImage );
	image.addEventListener( 'touchstart', startDragImage );
}


// Triggered when a draggable image is "pressed"

function startDragImage( event ) {

	// Disable window scroll (necessary on touch devices)
	document.body.style[ 'overflow' ] = 'hidden';

	// Store the clicked image in the variable "dragimage"
	dragimage = this;
	
	// Add 'scale' with zoomfactor to the image on press 
	var transform = dragimage.style[ 'transform' ].split( 'scale' );
	if ( transform.length > 1 ) transform = transform[ 0 ];
		
	dragimage.style[ 'transform' ] = transform + ' scale(' + zoomfactor + ')';
	
	// Get image to the foreground by assigning and increasing the 'zindex' variable
	dragimage.style[ 'z-index' ] = zindex++;
	
	// Store the current location in the data-prev-x/y attributes
	// (Needed to measure moves)
	dragimage.setAttribute( 'data-prev-x', event.pageX );
	dragimage.setAttribute( 'data-prev-y', event.pageY );
}  	

function dragImage( event ) {
	if ( !dragimage ) return false;
	
	// Get the current location on the screen ( in x and y coordinates)
	// converting the CSS transform property using the 'getImageOffset' function
	var offset = getImageOffset( dragimage );
	
	// Calculate the next coordinates using the offset 
	// and the difference between the current and previous locations
	var newx = offset.x + event.pageX - dragimage.getAttribute( 'data-prev-x' );
	var newy = offset.y + event.pageY - dragimage.getAttribute( 'data-prev-y' );
	
	// Store the current mouse x and y coordinates for later use											
	dragimage.setAttribute( 'data-prev-x', event.pageX );
	dragimage.setAttribute( 'data-prev-y', event.pageY );
	
	// Set the CSS transform property to display the image at the proper location and size
	dragimage.style[ 'transition' ] = '';
	dragimage.style[ 'transform' ] = 'translate3d(' + newx + 'px,' + newy + 'px, 0) '
								   + 'scale(' + zoomfactor + ')';
}

function stopDragImages( ) {

	// Enable window scroll again, since no image is being dragged
	document.body.style[ 'overflow' ] = 'auto';
	
	if ( dragimage ) {
		var transform = dragimage.style[ 'transform' ].split( 'scale' );
		if ( transform.length > 1 ) transform = transform[ 0 ];
		
		dragimage.style[ 'transform' ] = transform;
	}
	
	// Clear the 'dragimage', to cancel drag-behaviours
	dragimage = false;
}



// Initialize images by setting their initial values and adding a preload-behaviour

for ( var i=0; i<dragimages.length; i++ ) {

	// Disable native drag behaviour for images to hide the transparent images on top of the dragged ones
	dragimages[ i ].draggable = false;
	
	// Set the initial transform to (0, 0, 0)
	// (I use transform3d to increase responsvenes making the drag operation snappier)
	dragimages[ i ].style[ 'transform' ] = 'translate3d(0,0,0)';
	
	// Disable pointer-events to hide the drag cursor while the image is still loading (and invisible)
	dragimages[ i ].style[ 'pointer-events' ] = 'none';
	
	// Call the 'activateDragImage' function to fadein the image, 
	// enable mouse events and add drag behaviours
	dragimages[ i ].addEventListener( 'load', activateDragImage );
	
	// Trigger load event when image is already loaded or cached
	if ( dragimages[ i ].naturalWidth > 0 )
  	  dragimages[ i ].dispatchEvent( new Event( 'load' ) );
}


// Attach mouse and touch behaviours to the document
// (One event listener for all images on the document
// instead of all event listeners on all images)

document.addEventListener( 'mousemove', dragImage );
document.addEventListener( 'touchmove', dragImage );

document.addEventListener( 'mouseup', stopDragImages );
document.addEventListener( 'touchend', stopDragImages );

document.addEventListener( 'touchcancel', stopDragImages );
document.addEventListener( 'contextmenu', stopDragImages );


// Makes the images snap back to their initial position on resize
// to make sure everything stays accessible and cancel drag-actions

window.addEventListener( 'resize', function( ) {
	dragimage = false;
	
	for ( var i=0; i<dragimages.length; i++ ) {
		dragimages[ i ].style[ 'transition' ] = 'all ' + resetspeed;
		dragimages[ i ].style[ 'transform' ] = 'translate3d(0,0,0)';
	}
} );