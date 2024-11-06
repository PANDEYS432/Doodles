import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import "./../css/drawingBoard.css"
import { FaMousePointer } from "react-icons/fa";
const generator = rough.generator();


//creating element with its type color and coordinates--------------------------------------------------


const createElement = (id, x1, y1, x2, y2, type, options = {}) => {
  switch (type) {
    case "line":
    case "rectangle":
      const roughElement =
        type === "line"
          ? generator.line(x1, y1, x2, y2, { stroke: options.color })
          : generator.rectangle(x1, y1, x2 - x1, y2 - y1, { stroke: options.color });
      return { id, x1, y1, x2, y2, type, options, roughElement };
    case "circle":
      const circle = generator.circle(x1, y1, Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
      return { id, x1, y1, x2, y2, type, options, roughElement: circle };
    case "ellipse":
      const ellipse = generator.ellipse(x1, y1, Math.sqrt((x2 - x1) ** 2), Math.sqrt((y2 - y1) ** 2));
      return { id, x1, y1, x2, y2, type, options, roughElement: ellipse };
    case "pencil":
      return { id, type, points: [{ x: x1, y: y1 }], options };
    case "eraser":
      return { id, type, points: [{ x: x1, y: y1 }], options: { ...options, Thickness: options.Thickness || 50 } }; // Default Thickness for eraser
    // case "text":
    //   return { id, type, x1, y1, x2, y2, text: "" };
    case "clear_canvas":
      console.log("clearing canvas");
      return { id, type, x1, y1, x2, y2, text: "" };
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

//checks that the coordinate lies on a line chosen using selection tool----------------------------------------------
const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

// checking psotion with in element--------------------------------------------------------------------

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "line":
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    case "rectangle":
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case "circle":
      // const onthecircle=(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)==Math.sqrt((x - x1) ** 2 + (y - y1) ** 2))
      // console.log("circlec: "+type+" "+x1+" "+x2+" "+y1+" "+y2+" "+x+" "+y);
      // const insidethecircle=(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)-80>=Math.sqrt((x - x1) ** 2 + (y - y1) ** 2));
      // console.log(insidethecircle);
      // return insidethecircle;
      return false;
    case "pencil":
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
      });
      return betweenAnyPoint ? "inside" : null;
    // case "text":
    //   return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    default:
      throw new Error(`Type not recognised1: ${type}`);
  }
};



//calculating distance--------------------------------------------------------------------
const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));




//getting element on mouse click by looking at coordinates stored and its type----------------------------------------------

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
    .find(element => element.position !== null);
};

const adjustElementCoordinates = element => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};


const cursorForPosition = position => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};


//creating custom hook called usehistory--------------------------------------------------------------------

const useHistory = initialState => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState = typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo];
};

const getSvgPathFromStroke = stroke => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};



// called on mouse move -----------------------------------------------------------------------------

const drawElement = (roughCanvas, context, element, color, Thickness) => {
  switch (element.type) {
    case "line":
    case "rectangle":
    case "circle":
    case "ellipse":
      context.strokeStyle = element.options.color;
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      context.fillStyle = element.options.color;
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, { size: element.options.Thickness || Thickness }) // Default to Thickness if undefined
      );
      context.fill(new Path2D(stroke));
      break;
    case "eraser":
      context.fillStyle = "#ffffff";
      const stroke1 = getSvgPathFromStroke(
        getStroke(element.points, { size: element.options.Thickness || 50 }) // Default Thickness if undefined
      );
      context.fill(new Path2D(stroke1));
      break;
    // case "text":
    //   context.textBaseline = "top";
    //   context.font = "24px sans-serif";
    //   context.fillText(element.text, element.x1, element.y1);
    //   break;
    case "clear_canvas":
      context.clearRect(0, 0, roughCanvas.width, roughCanvas.height);
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = type => ["line", "rectangle"].includes(type);

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  useEffect(() => {
    const handleKeyDown = event => {
      setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
    };

    const handleKeyUp = event => {
      setPressedKeys(prevKeys => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(event.key);
        return updatedKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return pressedKeys;
};


/*element to be returned-------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------*/



const DrawingBoard = ({socketRef,roomId,name,isDrawer,switchofblack,startgametime,gtime,mysocketid}) => {

  //initialising default variables-------------------------------------------------------------------------
  const [img,setImg]=useState(null);
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("pencil");
  const [selectedElement, setSelectedElement] = useState(null);
  const [panOffset, setPanOffset] = useState({ x:0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] =useState({ x: 0, y: 0 });
  const [Thickness,setThickness]=useState(5);
  const [color,setColor]=useState("#FF0000");
  const [wordchosen,setwordchosen]=useState("");
  const [mousepos,setmousepos]=useState([200,200,""]);

  const textAreaRef = useRef();
  const pressedKeys = usePressedKeys();
  let canvasRef=useRef(null);
  let temp=(name==="a");
  
  //uselayout hook used-------------------------------------------------------------------------------

  useEffect(() => {
    if(socketRef.current==null) return;
    socketRef.current.on("whiteBoardDataResponse", ({imgUrl}) => {
      // console.log("enter: "+imgUrl);
      setImg(imgUrl);
    });
   
  }, [socketRef.current, canvasRef,img]);

  useEffect(()=>{
    if(socketRef.current==null) return;
    socketRef.current.on("wordchosenChanges",({word,mysocketid,coded,socketId})=>{
      if(socketId==mysocketid){
        setwordchosen(word);
      }
      else setwordchosen(coded);
      switchofblack();
    })
  },[socketRef.current,wordchosen])



  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    canvasRef.current=canvas;
    if(canvas==null || canvasRef.current==null) return;
    const context = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.save();
    context.translate(panOffset.x, panOffset.y);
    elements.forEach(element => {
      if (action === "writing" && selectedElement.id === element.id) return;
      drawElement(roughCanvas, context, element,color,Thickness);
    });
    const canvasImage = canvasRef.current.toDataURL();
    if(socketRef.current!=null){
      // console.log("sending");
      socketRef.current.emit("whiteboardData",{
        canvasImage,
        roomId,
        mysocketid
      });
    }
    
    
    context.restore();

    //receving change request from server side through socket-------------------------
    // if(socketRef.current!=null){
    //   socketRef.current.on("changeOnAllClients",({elements})=>{
    //     setElements(elements);
    //   })
    // }
    
  }, [elements, action, selectedElement, panOffset,socketRef.current]);


  // useEffect(()=>{
  //   // if(socketRef.current!=null){
  //     // socketRef.current.on("changeOnAllClients",({elements})=>{
  //     //   console.log("elements: "+elements);
  //     //   if(elements!=null){
  //     //     setElements([]);
  //     //   }
  //     // })
  //     if(socketRef.current!=null){
  //       socketRef.current.on("changeOnAllClients",({elements})=>{
  //         console.log("elements: ");
  //         if(elements!=null){
  //           console.log("hello");
  //         }
  //         // if(elements!=null){
  //         //   setElements([]);
  //         // }
  //       });
  //     }
      
  //   // }
  // },[socketRef.current,elements]);



  //useeffects used---------------------------------------------------------------------------------------


  useEffect(() => {
    const undoRedoFunction = event => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const panFunction = event => {
      setPanOffset(prevState => ({
        x: prevState.x - event.deltaX,
        y: prevState.y - event.deltaY,
      }));
    };

    document.addEventListener("wheel", panFunction);
    return () => {
      document.removeEventListener("wheel", panFunction);
    };
  }, []);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing") {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text;
      }, 0);
    }
  }, [action, selectedElement]);



  //updating element after moving that is updating coordinates-------------------------------------------------------
  const updateElement = (id, x1, y1, x2, y2, type, options) => {
    const elementsCopy = [...elements];
    // console.log(elementsCopy);
    switch (type) {
      case "line":
      case "rectangle":
      case "circle":
      case "ellipse":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type,options);
        break;
     
      case "pencil":
        case "eraser":
        elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
        break;
      // case "text":
      //   const textWidth = document
      //     .getElementById("canvas")
      //     .getContext("2d")
      //     .measureText(options.text).width;
      //   const textHeight = 24;
      //   elementsCopy[id] = {
      //     ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type,options),
      //     text: options.text,
      //   };
      //   break;
      default:
        throw new Error(`Type not recognised: ${type}`);
    }

    setElements(elementsCopy, true);
  };


  //getting coordinates of mouse pointer with respect to canvas--------------------------------------------------------------
  const getMouseCoordinates = event => {
    const clientX = event.clientX - panOffset.x;
    const clientY = event.clientY - panOffset.y;
    // console.log(clientX,clientY);
    return { clientX, clientY};
  };

  

  //handling mouse down event-------------------------------------------------------------------------------------------
  const handleMouseDown = event => {
    if (action === "writing") return;

    const { clientX, clientY} = getMouseCoordinates(event);
    

    if (event.button === 1 || pressedKeys.has(" ")) {
      setAction("panning");
      setStartPanMousePosition({ x: clientX, y: clientY });
      return;
    }

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      // console.log(element);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map(point => clientX - point.x);
          const yOffsets = element.points.map(point => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        }
        else if(element.type=="eraser"){
          const xOffsets = element.points.map(point => clientX - point.x);
          const yOffsets = element.points.map(point => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        }
        else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements(prevState => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool,{color,Thickness});
      setElements(prevState => [...prevState, element]);
      setSelectedElement(element);

      setAction(tool === "text" ? "writing" : "drawing");
    }
  };


  //handling mouse moving -----------------------------------------------------------------------------------------
  const handleMouseMove = event => {
    const { clientX, clientY } = getMouseCoordinates(event);

    socketRef.current.emit("showpointertoothers",{
      roomId,
      clientX,
      clientY,
      name
    })

    if (action === "panning") {
      const deltaX = clientX - startPanMousePosition.x;
      const deltaY = clientY - startPanMousePosition.y;
      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      });
      return;
    }

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element ? cursorForPosition(element.position) : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1,options } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool,options);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY,options:{color,Thickness} } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        const options = type === "text" ? { text: selectedElement.text } : {};
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);
      }
    } else if (action === "resizing") {
      const { id, type, position,...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
      updateElement(id, x1, y1, x2, y2, type);
    }

    //emitting mouse moving request on socket------------------------------------------------------
    socketRef.current.emit("onMouseMove",{
      roomId,
      elements,
    });
  };

  const handleMouseUp = event => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }

      const index = selectedElement.id;
      const { id, type ,options} = elements[index];
      if ((action === "drawing" || action === "resizing") && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type,options);
      }
    }

    if (action === "writing") return;

    setAction("none");
    setSelectedElement(null);
  };

  const handleBlur = event => {
    const { id, x1, y1, type } = selectedElement;
    setAction("none");
    setSelectedElement(null);
    updateElement(id, x1, y1, null, null, type, { text: event.target.value });
  };

  //clearing canvas function----------------------------------------------------------------------------------

  const clearCanavs=(event)=>{
    const { clientX, clientY} = getMouseCoordinates(event);
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // const id = elements.length;
    const element = createElement("clear_canvas", clientX, clientY, clientX, clientY, "clear_canvas");
    // console.log(...elements);
    // // console.log("ele: "+element);
    // const newState=[...elements, element];
    // console.log(newState);
    // setElements(newState);
    setElements([]);
  }

  //handling moving of mouse pointers------------------------------------------------
  useEffect(()=>{
    if(socketRef.current==null) return;
    socketRef.current.on("movingpointer",({roomId,clientX,clientY,name})=>{
      setmousepos([clientX,clientY,name]);
    })
  },[socketRef.current,mousepos]);

  //function for downloading image--------------------------------------------------------
  async function downloadimg(){
    const link=document.createElement("a");
    const image=document.createElement("img");
    console.log("img: ",img);
    image.src=img;
    console.log(image);
    link.download=`${Date.now()}.jpg`
    link.href=image;
    link.click();
  }

  return (
    <>
      
    {
      isDrawer ? (
        <div className="outerdiv_for_drawingboard">
      
      <div className="toolbox_div">
        {/* <input
          type="radio"
          id="selection"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        /> */}
        {/* <label htmlFor="selection">Selection</label> */}
        <input type="radio" id="line" checked={tool === "line"} onChange={() => setTool("line")} />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={tool === "rectangle"}
          onChange={() => setTool("rectangle")}
        />
        <label htmlFor="rectangle">Rectangle</label>
        <input
          type="radio"
          id="circle"
          checked={tool === "circle"}
          onChange={() => setTool("circle")}
        />
        <label htmlFor="circle">Circle</label>
        <input
          type="radio"
          id="ellipse"
          checked={tool === "ellipse"}
          onChange={() => setTool("ellipse")}
        />
        <label htmlFor="ellipse">Ellipse</label>
        <input
          type="radio"
          id="pencil"
          checked={tool === "pencil"}
          onChange={() => setTool("pencil")}
        />
        <label htmlFor="pencil">Pencil</label>

        <input
          type="radio"
          id="eraser"
          checked={tool === "eraser"}
          onChange={() => setTool("eraser")}
        />
        <label htmlFor="eraser">Eraser</label>
        {/* <input
          type="radio"
          id="fill"
          checked={tool === "fill"}
          onChange={() => setTool("fill")}
        />
        <label htmlFor="eraser">Fill</label> */}

        {/* <input type="radio" id="text" checked={tool === "text"} onChange={() => setTool("text")} />
        <label htmlFor="text">Text</label> */}
        <input
          type="range"
          min="0"
          max="20"
          onChange={(e) => setThickness(e.target.value)}
          value={Thickness}
        />
      </div>
      <div className="toolbox_div undo_redo_div">
        
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={downloadimg}>Download</button>
        <button id="clear_canvas" onClick={clearCanavs} className="clear_canvas_btn">Clear Canvas</button>
        <input onChange={(e) => setColor(e.target.value)} type="color" id="favcolor" name="favcolor" value={color}></input>
        {
          (wordchosen!="") ? <div className="wordchosendiv"><p className="wordchosen"><span>Word Selected: </span>{wordchosen}</p></div>:<></>
        }
        {
          (wordchosen!="") ? <div className="gtimediv"><h2 className="gtime">{gtime}</h2></div>:<></>
        }
      </div>
      
      <canvas
        ref={canvasRef}
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{zIndex: 1, backgroundColor:'white'}}
      >
        Canvas
      </canvas>
      
    </div>
      ) :
      (
        <div className="col-md-8 overflow-hidden border border-dark px-0 mx-auto mt-3" style={{ height: "100vh", width: "100vw", backgroundColor: "white" }}>
          <div className="mousediv" style={{left:mousepos[0],top:mousepos[1]}}>
            <FaMousePointer style={{color:'#097969'}}/>
            <p>{mousepos[2]}</p>
          </div>
          <img
            className="viewerimg"
            src={img}
          />
          {
            (wordchosen!="") ? <div className="codewordDiv">
            <p>Coded Word: {wordchosen}</p>
            </div>:<></>
          }
          {
            (wordchosen!="") ? <div className="gtimediv1"><h2 className="gtime1">{gtime}</h2></div>:<></>
          }

          {
            wordchosen!=""?<button className="downloadimgbtn" onClick={downloadimg}>Download</button>:<></>
          }
          
        </div>
      )
    }
    
    </>
  );
};

export default DrawingBoard;