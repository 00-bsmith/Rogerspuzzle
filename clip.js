shape_array = {
  polygon: [
    {
      coords: [[50, 25], [35, 67], [65, 67]]
    }
  ]
}

$box = $("#box")
$clipboard = $(".clipboard")
$handles = $(".handles")
$functions = $(".functions")
$demo_width = $("#demo_width")
$demo_height = $("#demo_height")

var start = shape_array.polygon[0];
(start_type = "polygon"),
(start_coords = start.coords),
(width = document.getElementsByClassName("demo-container")[0].offsetWidth - 40),
(height = document.getElementsByClassName("demo-container")[0].offsetHeight - 40)

$(function() {
  sizes()
  init()
  // Reevaluates max width/height on window resize
  $(window).resize(function() {
    var old_width = width
    var old_height = height

    handleReposition(old_width, old_height)
    sizes()
  })
})

function init() {
  type = start_type

  // Setup polygons
  $.each(shape_array.polygon, function(i, shape) {
    paths = ""

    $.each(shape.coords, function(i, coord) {
      type = "polygon"

      var x = coord[0] + "%"
      var y = coord[1] + "%"

      var path = "clip-path: polygon()"
      var coord = ""

      if (i == shape.coords.length - 1) {
        // last coordinate to add, omits a comma at the end
        paths += x + " " + y

        var clip_path = "polygon(" + paths + ")"

        appendFigure(clip_path, shape)
      } else {
        // loops through each coordinate and adds it to a list to add
        paths += x + " " + y + ", "
      }
    })
  })

  type = start_type

  setupDemo(start_coords)
}

function appendFigure(clip_path, shape) {
  // Add all the buttons to the .shapes container
  // considering using some other element other than figure for buttons to be more semantic...

  var webkit = ""
  var unprefixed = "clip-path: " + clip_path

  // Disable the element if we are not ready for it to be enabled
  if (shape.disabled == true) {
    var disabled = 'class="disabled" '
  } else {
    var disabled = ""
  }

  if ($(".webkit.block").hasClass("show")) {
    var webkit = "-webkit-clip-path: " + clip_path + ";"
  }

  if (type == "polygon") {
    var fig =
      '<figure class="gallery-cell" ' +
      disabled +
      'data-name="' +
      shape.name +
      '" data-type="polygon" data-coords="' +
      shape.coords.join(" ") +
      '">' +
      '<div style="' +
      webkit +
      " " +
      " " +
      unprefixed +
      '" class="shape ' +
      shape.name +
      '"></div>' +
      "<figcaption>" +
      shape.name +
      "</figcaption>" +
      "</figure>"
  }

  // Add .on class to the figure we are starting with
  $('[data-name="' + start.name + '"]').addClass("on")

  // listen for clicks on the figure buttons
  $("figure:not(.disabled)")
    .unbind()
    .click(function() {
      $("figure").removeClass("on")
      $(this).addClass("on")

      type = $(this).attr("data-type")

      if (type == "polygon") {
        new_shape = []

        // Coords at stored with data-coords attribute and turned into array
        var coords = $(this)
          .attr("data-coords")
          .split(" ")

        var coords = $.each(coords, function(i, coordinate) {
          var coordinate = coordinate.split(",")
          new_shape.push(coordinate)

          if (i == coords.length - 1) {
            start_coords = new_shape
            setupDemo(start_coords)
          }
        })
      }
    })
}

function setupDemo(coords) {
  // Run through each coordinate for the polygon
  $.each(coords, function(i, coord) {
    var x = coord[0]
    var y = coord[1]

    // Add unit to % coordinates
    var code_x = x + "%"
    var code_y = y + "%"

    // Convert % to px coordinates
    var x_px = Math.round((x / 100) * width)
    var y_px = Math.round((y / 100) * height)

    // Setup the polygon
    if (type == "polygon") {
      $handles.append(
        '<div class="handle" data-handle="' +
          i +
          '" style="top: ' +
          y_px +
          "px; left: " +
          x_px +
          'px;"></div>'
      )

      if (i == coords.length - 1) {
        $functions.append(
          '<code class="point" data-point="' +
            i +
            '">' +
            code_x +
            " " +
            code_y +
            "</code>"
        )
        $functions.prepend("polygon(").append(")")

        clipIt()
        readyDrag()
      } else {
        $functions.append(
          '<code class="point" data-point="' +
            i +
            '">' +
            code_x +
            " " +
            code_y +
            "</code>, "
        )
      }
    }
  })
}

function readyDrag() {
  // Utilizes the awesome draggabilly.js by Dave Desandro
  // Works well on touch devices
  var box = document.querySelector("#box")
  var handles = box.querySelectorAll(".handle")

  // If we have a circle, custom, or polygon setup draggibilly normally
  if (type == "polygon") {
    // We have already appended handles, now we will attach draggabilly to each of them
    for (var i = 0, len = handles.length; i < len; i++) {
      var handle = handles[i]

      new Draggabilly(handle, {
        containment: true
      })
        .on("dragStart", function(instance, e, pointer) {
          i = instance.element.dataset.handle

          // .changing triggers the bubble burst animation
          $point = $('[data-point="' + i + '"]')
          $point.addClass("changing")
        })
        .on("dragMove", function(instance, e, pointer) {
          // Returns current position of the dragging handle
          var x = instance.position.x
          var y = instance.position.y
          // Dragging a polygon handle, easy...
          if (type == "polygon") {
            setPoint(x, y)
          }
          clipIt()
        })
        .on("dragEnd", function(instance) {
          // Remove all the bubble animations
          $(".point").removeClass("changing")
        })
    }
  }
}

function setPoint(x, y) {
  // Changes the coordinates of a single point in the code block
  // Snap to the edges of demo
  // Consider using something like this instead of draggabilly's built-in grid[]
  var snap = 1

  var x = ((x / width) * 100).toFixed(0)
  if (x < snap) {
    var x = 0
  }
  if (x > 100 - snap) {
    var x = 100
  }
  var y = ((y / height) * 100).toFixed(0)
  if (y < snap) {
    var y = 0
  }
  if (y > 100 - snap) {
    var y = 100
  }

  // Add % if number is not zero
  if (x !== 0) {
    var x = x + "%"
  }
  if (y !== 0) {
    var y = y + "%"
  }
  $point.text(x + " " + y)
}

// Get the code in the code blocks and set the style inline on the clipboard
function clipIt() {
  var clip_path = $(".show.block").text()
  $clipboard.attr("style", clip_path)
  let livecoords = clip_path.replace('clip-path: polygon(','').replace(');','').match(/(\d+)/g)
  let vectorA = [$handles[0].childNodes[0].offsetTop + parseInt(getTransform($handles[0].childNodes[0])[1]), $handles[0].childNodes[0].offsetLeft + parseInt(getTransform($handles[0].childNodes[0])[0])]
  let vectorB = [$handles[0].childNodes[1].offsetTop + parseInt(getTransform($handles[0].childNodes[1])[1]), $handles[0].childNodes[1].offsetLeft + parseInt(getTransform($handles[0].childNodes[1])[0])]
  let vectorC = [$handles[0].childNodes[2].offsetTop + parseInt(getTransform($handles[0].childNodes[2])[1]), $handles[0].childNodes[2].offsetLeft + parseInt(getTransform($handles[0].childNodes[2])[0])]
  let triangleCenter = getTriangleCentroid([{x: vectorA[0], y: vectorA[1]}, {x: vectorB[0], y: vectorB[1]}, {x: vectorC[0], y: vectorC[1]}])
  $('.location').css('top', Math.floor(triangleCenter[0])).css('left', Math.floor(triangleCenter[1]))
}

function getTriangleCentroid(arr) {
  let centerX = (arr[0].x + arr[1].x + arr[2].x) / 3
  let centerY = (arr[0].y + arr[1].y + arr[2].y) / 3
  return [centerX, centerY];
}

function getTransform(el) {
  var results = $(el).css('transform').match(/matrix(?:(3d)\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))(?:, (-{0,1}\d+)), -{0,1}\d+\)|\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))\))/)

  if(!results) return [0, 0, 0];
  if(results[1] == '3d') return results.slice(2,5);

  results.push(0);
  return results.slice(5, 8);
}

// If the demo area's size is changed we need to reposition each handle
function handleReposition(old_width, old_height) {
  $(".handle").each(function() {
    var x_pct = parseInt($(this).css("left")) / old_width
    var y_pct = parseInt($(this).css("top")) / old_height

    var new_x = x_pct * width + "px"
    var new_y = y_pct * height + "px"

    // Reposition each handle
    $(this).css({
      left: new_x,
      top: new_y
    })
  })
}

// Resize the demo box
function sizes() {
  console.log("sizes();")

  // Adjust for 10px padding on each side because of the handles
  var adjusted_width = parseInt(width) + 20
  var adjusted_height = parseInt(height) + 20

  $demo_width.val(width)
  $demo_height.val(height)

  $box.css({
    width: adjusted_width,
    height: adjusted_height
  })
}
