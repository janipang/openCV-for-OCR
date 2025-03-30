import { useEffect, useState } from "react";
import "./recent.css";
import BackUp from "../types/backup";
import { formatDateTime } from "../services/format-date";

export default function RecentPage() {
  const [backUpData, setBackUpData] = useState<BackUp[]>([]);

  async function getBackUpData(){
      try{
          const result = await window.electron.getBackUps();
          console.log("getBackUps sent, main process recieved with status: ", result);
          setBackUpData(result);
      } catch (error) {
          console.error("Error in sending putTemplateName:", error);
      }
  }

  async function handleDeleteBackUp(id:string) {
    try{
      const result = await window.electron.deleteBackUp(id);
      getBackUpData()
      console.log("deleteBackUp sent answered with: ", result)
    }
    catch(error){
      console.error("Error in sending deleteBackUp: ", error);
    }
  }

  useEffect(()=>{
    getBackUpData();
  },[])
  return (
    <article className="recent">
      <section className="backup">
        <h2 className="title">Files Back Up</h2>
        <span className="list">
          <div className="list-content">
            {backUpData.map((item) => (
              <span className="list-item">
                <span className="wide-card" key={item.id}>
                  <span className="info">
                    <p className="name">{item.name}</p>
                    <p className="separator">•</p>
                    <p className="time">{formatDateTime(item.date)}</p>
                  </span>
                  <button className="icon-button open" onClick={()=>{window.electron.openFolder(item.location)}}>
                    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20.2C3.45 20.2 2.97933 20.0043 2.588 19.613C2.19667 19.2217 2.00067 18.7507 2 18.2V6.20001C2 5.65001 2.196 5.17935 2.588 4.78801C2.98 4.39668 3.45067 4.20068 4 4.20001H9.175C9.44167 4.20001 9.696 4.25001 9.938 4.35001C10.18 4.45001 10.3923 4.59168 10.575 4.77501L12 6.20001H20C20.55 6.20001 21.021 6.39601 21.413 6.78801C21.805 7.18001 22.0007 7.65068 22 8.20001V18.2C22 18.75 21.8043 19.221 21.413 19.613C21.0217 20.005 20.5507 20.2007 20 20.2H4ZM4 18.2H20V8.20001H11.175L9.175 6.20001H4V18.2Z" fill="white"/>
                    </svg>
                    <p>Open</p>
                  </button>
                </span>
                <button className="active-icon" onClick={() => handleDeleteBackUp(item.id)}>
                  <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.1667 4.16663V4.66663H18.6667H22.6667C22.8877 4.66663 23.0996 4.75442 23.2559 4.9107C23.4122 5.06698 23.5 5.27894 23.5 5.49996C23.5 5.72097 23.4122 5.93294 23.2559 6.08921C23.0996 6.2455 22.8877 6.33329 22.6667 6.33329H21.3333H20.8333V6.83329V21.5C20.8333 22.4282 20.4646 23.3185 19.8082 23.9748C19.1518 24.6312 18.2616 25 17.3333 25H6.66667C5.73841 25 4.84817 24.6312 4.19179 23.9748C3.53542 23.3185 3.16667 22.4282 3.16667 21.5V6.83329V6.33329H2.66667H1.33333C1.11232 6.33329 0.900358 6.2455 0.744078 6.08921L0.390524 6.44277L0.744077 6.08921C0.587797 5.93293 0.5 5.72097 0.5 5.49996C0.5 5.27895 0.587797 5.06698 0.744077 4.9107L0.390524 4.55715L0.744078 4.9107C0.900358 4.75442 1.11232 4.66663 1.33333 4.66663H5.33333H5.83333V4.16663V2.83329C5.83333 2.25866 6.06161 1.70756 6.46794 1.30123C6.87426 0.894899 7.42536 0.666626 8 0.666626H16C16.5746 0.666626 17.1257 0.894899 17.5321 1.30123C17.9384 1.70756 18.1667 2.25866 18.1667 2.83329V4.16663ZM16.5 2.83329V2.33329H16H8H7.5V2.83329V4.16663V4.66663H8H16H16.5V4.16663V2.83329ZM19.1667 6.83329V6.33329H18.6667H5.33333H4.83333V6.83329V21.5C4.83333 21.9862 5.02649 22.4525 5.37031 22.7963C5.71412 23.1401 6.18044 23.3333 6.66667 23.3333H17.3333C17.8196 23.3333 18.2859 23.1401 18.6297 22.7963C18.9735 22.4525 19.1667 21.9862 19.1667 21.5V6.83329Z" fill="black" stroke="black"/>
                    <path d="M8.5 10H10.1667V19.6667H8.5V10ZM13.8333 10H15.5V19.6667H13.8333V10Z" fill="black" stroke="black"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </span>
      </section>
    </article>
  );
}
