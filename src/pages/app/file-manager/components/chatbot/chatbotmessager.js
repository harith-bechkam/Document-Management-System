import { render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import _, { update } from 'lodash';
import * as API from '../../../../../utils/API';


const ChatbotListener = ({workspace}) => {
  const location = useLocation(); // React Router hook to get current path
  const [workspaceData,setWorkspaceData]=useState(workspace || [])

  const checkLoginStatus = () => {
        const userLoggedIn = localStorage.getItem("workspace_id") && localStorage.getItem("userId") ?true:false;
        if(userLoggedIn){
            document.querySelectorAll("#chatbot").forEach(el => {
                el.style.display = "block"; // Show chatbot
            });
            }else{
            document.querySelectorAll("#chatbot").forEach(el => {
                el.style.display = "none"; // Show chatbot
            });
        }
  };
// const fetchworkspaceinfo=async()=>{
//   let workspaceResponse = await API.getmyworkspaceinfo()
//     let { status, data } = workspaceResponse

//     if (status) {
//         setWorkspaceData(data)
//     }
// }

const canshowChatBot = () => {
    const workspace = workspaceData?.find(work => work?._id == localStorage.getItem("workspace_id"))
    const planDetails = workspace?.planDetails

    if (planDetails?.isActivePlan) {
        return planDetails?.grantedFeatures?.hasOwnProperty('chatBot') && planDetails?.grantedFeatures?.chatBot == "yes"
    }
    return false
}
    
  const triggerPathUpdateEvent=async (pathname)=>{
    if (document.getElementById("chatbot") && typeof window.botpressWebChat!=="undefined") {
        let currentdir=[];
        let currentPathname="";
        pathname=pathname.split("/");
        if(pathname.length>1){
            let path1=pathname[pathname.length-2];
            let path2=pathname[pathname.length-1];
            if(path1=="section" || path1=="folder" || path2=="share"){
                currentdir.push(path2)
            }
            if(path2=="shared"){
                currentdir.push("shared")
            }
        }
        if(currentdir.length>0 && currentdir[0]!="shared"){
            let pathRespo = await API.getDirectoryPath(currentdir[0]);
            if(pathRespo.status && pathRespo.data.length>0){
                currentPathname=pathRespo.data[pathRespo.data.length-1]["name"];
            }
        }else if(currentdir.length>0 && currentdir[0]=="shared"){
            currentPathname="Shared With Me";
        }
        if(!document.getElementById("mycurrentnav") && currentPathname!=""){
            document.getElementById("bp-web-widget").insertAdjacentHTML("beforeend", "<div id='mycurrentnav'><span class='searchBadge badge bg-primary rounded-pill'>"+currentPathname+"</span></div>");
        }
        else{
            if(document.getElementById("mycurrentnav")){
                if(currentPathname!=""){
                    document.getElementById("mycurrentnav").innerHTML="<span class='searchBadge badge bg-primary rounded-pill'>"+currentPathname+"</span>";
                }else{
                    document.getElementById("mycurrentnav").innerHTML="";
                }
            }
        }
        window.botpressWebChat.sendEvent({
            type: "user_data",
            channel: "web",
            payload: {
                text: "Hello! How can I help you today?",
                workspaceId: localStorage.getItem("workspace_id"),
                accessToken: localStorage.getItem("accessToken"),
                userId: localStorage.getItem("userId"),
                currentdir:currentdir,
                currentPathname:currentPathname,
                source:"iDoks"
        }})
    }
  }  

  const initbot=async ()=>{
    if(!document.getElementById("objectassign") && canshowChatBot()){
        const script = document.createElement("script");
        script.id = "objectassign";
        script.src = "https://bot.idoks.ai/assets/modules/channel-web/object_assign.js";
        script.onload = () => {
            const interval = setInterval(() => {
                if (window.botpressWebChat) {
                    // Listen for localStorage changes (useful for multi-tab login/logout)
                    window.addEventListener("storage", checkLoginStatus);
                    window.botpressWebChat.init({
                        botId: "idoks",
                        host: "https://bot.idoks.ai/",
                        enablePersistence: true, // Retains messages across sessions
                        showCloseButton: true,
                        customStyleSheet:"https://bot.idoks.ai/assets/modules/channel-web/stylesheet.css"
                    }, '#chatbot');

                    window.addEventListener("message", async function(event) {

                        if (event.data &&  event.data.name === "webchatReady") {
                            triggerPathUpdateEvent(window.location.href);
                        }else if (event.data && event.data.name === "webchatOpened") {
                            document.getElementById("chatbot").classList.remove("chatclosed")
                            document.getElementById("chatbot").classList.add("chatopened")
                        } else if (event.data && event.data.name === "webchatClosed") {
                            document.getElementById("chatbot").classList.add("chatclosed")
                            document.getElementById("chatbot").classList.remove("chatopened")
                        }
                        console.log(event.data.name)
                    })

                    checkLoginStatus();
                    clearInterval(interval); // Stop checking once chatbot is found
                }
            },1000);
        }
        const injectscript = document.createElement("script");
        injectscript.src = "https://bot.idoks.ai/assets/modules/channel-web/inject.js";
        document.body.appendChild(script);
        document.body.appendChild(injectscript);
    }
  }
  useEffect(() => {
    if(location.pathname)  triggerPathUpdateEvent(location.pathname)
  }, [location]); // Runs whenever location changes

  useEffect(()=>{
    // fetchworkspaceinfo()
    initbot();
    window.addEventListener("storage",initbot)
    return () => {
        window.removeEventListener("storage", initbot);
      };
  },[])
  return (
    <div id="chatbot" className="chatclosed" style={{display: "none"}}></div>
  ); // No UI, just functionality
};

export default ChatbotListener;
