import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import { initSocket } from "../socket";
import Drawingboard from "../components/Drawingboard";
import OnlineFriend from "../components/OnlineFriend";
import logo from "./../images/scribble.png";
import { useAuth0 } from "@auth0/auth0-react";
import correctsound from "./../images/correct_sound.wav";
import nextlevelsound from "./../images/nextlevel.mp3";
import endgamesound from "./../images/endroundsound.mp3";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { clear } from "@testing-library/user-event/dist/clear";
// import Standing from "./../components/Standing"
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";

//list of words--------------------------------------------------------------------------------------
const words = [
  "apple",
  "basketball",
  "candle",
  "dolphin",
  "envelope",
  "fireworks",
  "giraffe",
  "hamburger",
  "island",
  "jigsaw",
  "kangaroo",
  "lighthouse",
  "magnet",
  "notebook",
  "octopus",
  "penguin",
  "quilt",
  "robot",
  "sailboat",
  "tiger",
  "umbrella",
  "violin",
  "watermelon",
  "xylophone",
  "yoga",
  "zeppelin",
  "astronaut",
  "butterfly",
  "compass",
  "diamond",
  "eagle",
  "flamingo",
  "globe",
  "hockey",
  "igloo",
  "jellyfish",
  "koala",
  "lemonade",
  "mermaid",
  "ninja",
  "puzzle",
  "rhinoceros",
  "spaceship",
  "tornado",
  "unicorn",
  "volcano",
  "waffle",
  "xylograph",
  "yacht",
  "zebra",
];

const Whiteboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth0();
  const [Chatval, setChatval] = useState("");
  const [Chathistory, setChathistory] = useState([]);
  const [gamestarted, setgamestarted] = useState(0);
  const [isDrawer, setisDrawer] = useState(0);
  const [chosenwords, setchosenwords] = useState([]);
  const [shouldishow, setshouldishow] = useState(0);
  const [drawer, setdrawer] = useState("sarthak");
  const [mysocketid, setmysocketid] = useState(0);
  const [guessCorrect, setguessCorrect] = useState(0);
  const reactNavigator = useNavigate();
  if (isAuthenticated != true) {
    reactNavigator("/");
  }
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  // const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const name = location.state?.username;
  const isHost = location.state.isHost;
  const [ctime, setctime] = useState(20);
  const [gtime, setgtime] = useState(30);
  const [restime, setrestime] = useState(8);
  const [showres, setshowres] = useState(0);
  const [levelscores, setlevelscores] = useState(null);
  const [levelword, setlevelword] = useState("");
  const [drawersocketid, setdrawersocketid] = useState("");
  const [start, setstart] = useState(false);
  const [standings, setstandings] = useState([]);
  const [showstandings, setshowstandings] = useState(0);
  const [showspeech, setshowspeech] = useState(0);
  const [muteId,setmuteId]=useState(null);
  const [showpowerdiv,setshowpowerdiv]=useState(0);
  const [onlinefriendsdata,setonlinefriendsdata]=useState([]);
  const [showonlinefriend,setshowonlinefriends]=useState(0);
  // console.log("am i the host "+isHost);

  //making speech recognition--------------------------------------------------------------------------
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };
  const stoplistening = () => {
    setChatval(transcript);
    resetTranscript();
    SpeechRecognition.stopListening();
  };
  var { transcript, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();
  // if (!browserSupportsSpeechRecognition) {
  //     return null;
  // }

  //initilising timer for settimeouts-----------------------------------------------------------------------------

  var ctimer, gtimer, restimer;

  //iniitialising socket using useeffect----------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      //handling errors
      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later. "+e);
        reactNavigator("/");
      }

      //joining socket
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
        email: user.email,
        Private:location.state?.Private
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          console.log(socketId);
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients((prev)=>{return clients});
          setmysocketid(socketId);
        }
      );

      //handling sentchat response coming from backend
      // socketRef.current.on("sentchat",(payload)=>{
      //     console.log("chat recievd");
      //     console.log(payload.name +" "+payload.chat);
      //     console.log("the history is "+Chathistory);
      //     setChathistory([...Chathistory,payload]);
      // });

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      //disconnecting events of socket
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on("sentchat", (payload) => {
      // console.log(payload.mysocketid+" "+mysocketid);
      if (
        payload.isguesscorrect == 1 &&
        payload.mysocketid == payload.socketId
      ) {
        console.log("playing sound");
        playcorrectsound();
      }
      setChathistory([...Chathistory, payload]);
      // console.log(payload.clients);
      setClients(payload.clients);
    });
  }, [socketRef.current, Chathistory]);

  //copying to clipboard code--------------------------------------------------------------------------
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  //handling change in input box------------------------------------------------------

  function inputchange(e) {
    let val = e.target.value;
    setChatval(val);
    console.log(Chatval);
  }

  //sending chat button function---------------------------------------------------------

  function sendChatFunc() {
    if (Chatval == "") return;
    setguessCorrect(0);
    socketRef.current.emit("sendchat", {
      roomId,
      Chatval,
      name,
      mysocketid,
      gtime,
    });
    setChatval("");
  }

  //start game function for host----------------------------------------------------------------

  async function chooseDrawer() {
    console.log("choosing artist");
    setgamestarted(1);
    setstart(true);
    socketRef.current.emit("choosedrawer", {
      roomId,
    });
  }

  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on(
      "drawerchosen",
      ({ chosensocketid, socketId, drawername }) => {
        if (chosensocketid == socketId) {
          var rand1 = Math.floor(Math.random() * 10);
          var rand2 = 10 + Math.floor(Math.random() * 10);
          var rand3 = 20 + Math.floor(Math.random() * 10);

          setisDrawer(1);
          setshouldishow(1);
          setchosenwords([rand1, rand2, rand3]);
        } else {
          setshouldishow(1);
          setisDrawer(0);
        }
        setdrawer(drawername);
        setdrawersocketid(chosensocketid);
        setmysocketid(socketId);
        setgamestarted(1);
        // console.log("drawer: "+drawername);
      }
    );
  }, [
    socketRef.current,
    chosenwords,
    isDrawer,
    shouldishow,
    drawer,
    drawersocketid,
    mysocketid,
    gamestarted
  ]);

  //function called when the drawer chooses the word he has to draw--------------------------------------------------

  async function wordSelected(e) {
    var word = e.target.value;
    socketRef.current.emit("storeChosenWordInBackend", {
      roomId,
      word,
      mysocketid,
    });
  }

  //setting timer for choosing a word-----------------------------------------------------------------

  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on(
      "showtimetochooser",
      ({ countdown, chosensocketid }) => {
        console.log(countdown);
        // console.log(mysocketid + " " + chosensocketid);
        if (mysocketid == chosensocketid && countdown <= 0) {
          console.log("choose me");
          console.log(chosenwords);
          socketRef.current.emit("storeChosenWordInBackend", {
            roomId,
            word: words[Math.floor(Math.random() * words.length)],
            mysocketid,
          });
          return;
        } else if (mysocketid == chosensocketid) {
          setctime(countdown);
        }
      }
    );
  }, [socketRef.current]);

  useEffect(() => {
    if (socketRef.current == null) return;

    socketRef.current.on(
      "showtimetoguessers",
      ({ countdown, chosensocketid, socketId }) => {
        console.log("showtime: " + countdown);
        if (countdown <= 0 && socketId == chosensocketid) {
          console.log("calling");
          socketRef.current.emit("endround", {
            roomId,
            mysocketid,
            countdown,
          });
          return;
        } else if (countdown <= 0) return;
        else setgtime(countdown);
      }
    );
    socketRef.current.on("kickedFromRoom",({roomId})=>{
      leaveRoom();
    })
  }, [socketRef.current]);

  //playing sound function-----------------------------------------------------------------

  function playcorrectsound() {
    new Audio(correctsound).play();
  }
  function playnextlevelsound() {
    new Audio(nextlevelsound).play();
  }

  //to turn of display of choose word div-------------------------------------------------
  function switchofblack() {
    setshouldishow(0);
  }

  //ending of round request---------------------------------------------------------------
  useEffect(() => {
    if (socketRef.current == null) return;
    if (showres == 1) return;
    socketRef.current.on("movetonextround", ({ socketId, rounddata, word }) => {
      console.log(rounddata);
      setshowres(1);
      setlevelscores(rounddata);
      setlevelword(word);
      playnextlevelsound();
    });
  }, [socketRef.current]);

  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on("stopres", ({ roomId, drawersocket, socketId }) => {
      console.log("stopping");
      setshowres(0);
      if (socketId == drawersocket) {
        chooseDrawer();
        return;
      }
    });
  }, [socketRef.current]);

  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on("showfinalres", ({ clients, roomId, socketId }) => {
      clients.sort(function (a, b) {
        return b.points - a.points;
      });
      // console.log(clients);
      setshowstandings(1);
      setstandings(clients);
      playendgamesound();
    });
  }, [socketRef.current, standings, showstandings]);
  function playendgamesound() {
    console.log("playing result sound");
    new Audio(endgamesound).play();
  }

  //warning for wrong language------------------------------------------------------------
  useEffect(() => {
    if (socketRef.current == null) return;
    socketRef.current.on("warning", ({ roomId, ct }) => {
      alert(
        `(${ct}/3)Please Look into your language.Doing it multiple times can lead to banning your chat functionality😡😡😡!!`
      );
    });
  }, [socketRef.current]);

  //kicking socket request------------------------------------------------------------------------
  useEffect(()=>{
    if(socketRef.current==null) return;
    socketRef.current.on("tellAboutKicking",({roomId,sender,receiver,ct})=>{
      const payload={
        name:sender[0],
        receiver:receiver[0],
        isguesscorrect:1,
        kick:1,
        ct:ct
      }
      setChathistory([...Chathistory, payload]);
    })
  },[socketRef.current,Chathistory])

  //moving mouse pointer--------------------------------------------------------------------

  //leaving room button ----------------------------------------------------------------------------
  async function goBackToMainPage(e) {
    navigate(`/`, {});
  }
  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  //opening powers to users------------------------------------------------------------------------

  function openpowers(e){
    const id=e.currentTarget.getAttribute("value");
    // console.log("id: ",id," ",mysocketid);
    if(id==mysocketid) return;
    
    // console.log(id);
    setmuteId(id);
    setshowpowerdiv(1);
  }

  async function closeshowpower(){
    setshowpowerdiv(0);
  }

  async function closeshowonlinefriends(){
    setshowonlinefriends(0);
  }

  async function mutePerson(){
    socketRef.current.emit("mutethisperson",{roomId,mysocketid,muteId});
    toast.success('Muted This person succesfully');
  }

  async function unmutePerson(){
    socketRef.current.emit("unmutethisperson",{roomId,mysocketid,muteId});
    toast.success('Unmuted This person succesfully');
  }

  async function sendFriendRequest(){
    socketRef.current.emit("sendFriendRequest",{roomId,mysocketid,muteId});
    toast.success('Friend request sent succesfully');
  }

  async function kickPerson(){
    socketRef.current.emit("kickthisperson",{roomId,mysocketid,muteId});
    toast.success('Notified team members about kicking request');
  }

  async function showfriendfunc(){
    console.log("showing friends");
    const getonlinefriends=await fetch(`${process.env.REACT_APP_LOCALURL}/getonlinefriends`,{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    const data=await getonlinefriends.json();
    console.log(data.arr);
    setshowonlinefriends(1);
    setonlinefriendsdata(data.arr);
  }

  //html code for drawing board
  return (
    <div className="mainWrap">
      {isDrawer && shouldishow ? (
        <div className="choosewordmaindiv">
          <p>Choose The Word:</p>
          <div className="chooseworddiv">
            <button
              onClick={wordSelected}
              value={words[chosenwords[0]]}
              className="wordsbtn"
            >
              {words[chosenwords[0]]}
            </button>
            <button
              onClick={wordSelected}
              value={words[chosenwords[1]]}
              className="wordsbtn"
            >
              {words[chosenwords[1]]}
            </button>
            <button
              onClick={wordSelected}
              value={words[chosenwords[2]]}
              className="wordsbtn"
            >
              {words[chosenwords[2]]}
            </button>
          </div>
          <h1>{ctime}</h1>
        </div>
      ) : (
        <></>
      )}

      {!isDrawer && shouldishow ? (
        <div className="whoisdrawingdiv">
          <p>{drawer} is choosing the word!!</p>
        </div>
      ) : (
        <></>
      )}

      {showres ? (
        <div className="roundresultdiv">
          <h3>
            The Chosen Word Was: <span>{levelword}</span>
          </h3>
          <div className="roundresult_innerdiv">
            {levelscores.map((userlevelscore) => {
              console.log(userlevelscore);
              return userlevelscore.roundpoints == 0 ? (
                <div>
                  <p className="notscored">
                    <span>{userlevelscore.username} : </span>{" "}
                    {userlevelscore.roundpoints}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="scored">
                    <span>{userlevelscore.username} :</span> +
                    {userlevelscore.roundpoints}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <></>
      )}

      {showstandings ? (
        <div className="showstandings">
          <div className="standings_outerdiv">
            <h2>Congratulations To All Winners 🎉🎉🎉!!</h2>
            <div className="standings_innerdiv">
              {standings.map((payload, index) => {
                if (index == 0) {
                  return (
                    <div className="individual_standings gold">
                      <div className="standings_name">
                        <p>{payload.username}:</p>
                      </div>
                      <div className="standings_points">
                        <p>{payload.points}</p>
                      </div>
                    </div>
                  );
                } else if (index == 1) {
                  return (
                    <div className="individual_standings silver">
                      <div className="standings_name">
                        <p>{payload.username}</p>
                      </div>
                      <div className="standings_points">
                        <p>{payload.points}</p>
                      </div>
                    </div>
                  );
                } else if (index == 2) {
                  return (
                    <div className="individual_standings bronze">
                      <div className="standings_name">
                        <p>{payload.username}</p>
                      </div>
                      <div className="standings_points">
                        <p>{payload.points}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="individual_standings nomedal">
                      <div className="standings_name">
                        <p>{payload.username}</p>
                      </div>
                      <div className="standings_points">
                        <p>{payload.points}</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            <button onClick={goBackToMainPage} className="endgamebtn">
              End Game
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {
        showpowerdiv && gamestarted?(
          <>
            <div className="power_outerdiv">
              <IoMdClose size={50} onClick={closeshowpower} className="closebtn"/>
              <div className="power_innerdiv">
                <button className="powerbtn loginbtn mutebtn" onClick={mutePerson} value={muteId}>Mute</button>
                <button className="powerbtn loginbtn unmutebtn" onClick={unmutePerson} value={muteId}>Unmute</button>
                <button className="powerbtn loginbtn addfriendbtn" onClick={sendFriendRequest} value={muteId}>Add Friend</button>
                <button className="powerbtn loginbtn kickbtn" onClick={kickPerson} value={muteId}>Kick</button>
              </div>
            </div>
          </>
        ):<></>
      }
      
      {
        showonlinefriend && !gamestarted?(
          <div className="showonlinefriendsdiv">
            <IoMdClose size={50} onClick={closeshowonlinefriends} className="onlinefriendsclosebtn"/>
              {
                <div className="showonlinefriendsinnerdiv">
                  <h3>Friends Online:</h3>
                  {onlinefriendsdata!=null && onlinefriendsdata.length!=0?(
                    onlinefriendsdata?.map((element)=>{
                      return (<OnlineFriend sender={user.email} name={element[0]} email={element[1]} roomId={roomId} />)
                    })
                  ):<p>No Friend Is Online</p>}
                </div>
              }
            
          </div>
        ):<></>
      }


      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src={logo} alt="logo" />
            <h2>Picasso</h2>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients?.map((client) => (
              
              <Client
                username={client.username}
                points={client.points}
                openpowers={openpowers}
                clientId={client.socketId}
                mysocketid={mysocketid}
              />
            ))}
          </div>
        </div>
        {isHost && !gamestarted ? (
          <button onClick={chooseDrawer} className="start_game_btn">
            Start Game
          </button>
        ) : (
          <></>
        )}
        <button className="btn showfrndsbtn" onClick={showfriendfunc}>
          Show Online Friends
        </button>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="leftaside">
        <Drawingboard
          socketRef={socketRef}
          roomId={roomId}
          name={name}
          isDrawer={isDrawer}
          switchofblack={switchofblack}
          gtime={gtime}
          mysocketid={mysocketid}
        />
      </div>

      <div className="chat-div">
        <h3 className="chatheading">Chat Box</h3>
        <div className="chat_topdiv">
          {Chathistory.map((payload, index) => {
            return (
              <>
                {payload.isguesscorrect ? (
                  
                  payload.kick?(
                    <div className="kickingdiv">
                      <p>{payload.name} has voted to kick for {payload.receiver} ({payload.ct}/3) 🫥🫥!!</p>
                    </div>
                  ):(
                    <div className="correctanswerdiv">
                      <p>{payload.name} has guessed the word correctly 🎉🎉!!</p>
                    </div>
                  )
                  
                ) : (
                  <div className="onechatdiv">
                    <p>
                      <span>{payload.name} : </span>
                      {payload.chat}
                    </p>
                    {/* <div className='chatusernamediv'>
                                            <p className='chatusername'>{payload.name}:  </p>
                                        </div>
                                        <div className='chatmsgdiv'>
                                            <p className="chatmsg" key={index}>{payload.chat}</p>
                                        </div> */}
                  </div>
                )}
              </>
            );
          })}
        </div>
        <div className="speech_div">
          <div className="micon">
            <CiMicrophoneOn onClick={startListening} className="start_listen" />
          </div>
          <div className="micoff">
            <CiMicrophoneOff onClick={stoplistening} className="start_listen" />
          </div>
        </div>
        <div className="speech_fake_show">{transcript}</div> 
                {/* {
                    showspeech ? <div className='chat_bottomdiv'>
                    <input value={transcript}  name="chat" onChange={inputchange} placeholder="Chat/Guess" className='inputchat'></input>
                    <button onClick={sendChatFunc} className='sendchat'>send</button>
                    </div>:
                    <div className='chat_bottomdiv'>
                        <input value={Chatval}  name="chat" onChange={inputchange} placeholder="Chat/Guess" className='inputchat'></input>
                        <button onClick={sendChatFunc} className='sendchat'>send</button>
                    </div>
                } */}
        <div className="chat_bottomdiv">
          <input
            value={Chatval}
            name="chat"
            onChange={inputchange}
            placeholder="Chat/Guess"
            className="inputchat"
          ></input>
          <button onClick={sendChatFunc} className="sendchat">
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Whiteboard);
