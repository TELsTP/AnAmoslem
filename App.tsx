limport { useEffect, useState } from "react"; 
function App() {
  const [data, setData] = useState<any>(null); 
  useEffect(() => {
    fetch("/fatiha.json") .then((res) => 
      res.json()) .then((json) => setData(json)) 
      .catch((err) => console.error("JSON error:", 
      err));
  }, []);
  if (!data) { return <p>جاري التحميل...</p>;
  }
  return ( <div> <h1>سورة الفاتحة</h1> <ul> 
        {data.verses.map((verse: string, index: 
        number) => (
          <li key={index}>{verse}</li> ))} </ul> 
    </div>
  );
}
export default App;
