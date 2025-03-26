import { useEffect, useState } from "react";
import "./recent.css";
import BackUp from "../types/backup";
import { formatDateTime } from "../services/format-date";

export default function RecentPage() {
  const [backUpData, setBackUpData] = useState<BackUp[]>([]);

  useEffect(()=>{
    async function getBackUpData(){
        try{
            const result = await window.electron.getBackUps();
            console.log("getBackUps sent, main process recieved with status: ", result);
            setBackUpData(result);
        } catch (error) {
            console.error("Error in sending putTemplateName:", error);
        }
    }

    getBackUpData();
  },[])
  return (
    <article className="recent">
      <section className="back-up">
        <h2 className="title">Files Back Up</h2>
        <span className="list">
          <div className="list-content">
            {backUpData.map((item) => (
              <span className="wide-card" key={item.id}>
                <span className="info">
                  <p className="name">{item.name}</p>
                  <p className="time">{formatDateTime(item.date)}</p>
                </span>
                <button className="icon-button" onClick={()=>{}}>
                  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 20.2C3.45 20.2 2.97933 20.0043 2.588 19.613C2.19667 19.2217 2.00067 18.7507 2 18.2V6.20001C2 5.65001 2.196 5.17935 2.588 4.78801C2.98 4.39668 3.45067 4.20068 4 4.20001H9.175C9.44167 4.20001 9.696 4.25001 9.938 4.35001C10.18 4.45001 10.3923 4.59168 10.575 4.77501L12 6.20001H20C20.55 6.20001 21.021 6.39601 21.413 6.78801C21.805 7.18001 22.0007 7.65068 22 8.20001V18.2C22 18.75 21.8043 19.221 21.413 19.613C21.0217 20.005 20.5507 20.2007 20 20.2H4ZM4 18.2H20V8.20001H11.175L9.175 6.20001H4V18.2Z" fill="white"/>
                  </svg>
                  <p>Open</p>
                </button>
              </span>
            ))}
          </div>
        </span>
      </section>
    </article>
  );
}
