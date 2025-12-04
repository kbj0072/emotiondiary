import { Link, Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/Home";
import New from "./pages/New";
import Diary from "./pages/Diary";
import Edit from "./pages/Edit";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  DiaryDispatchContext,
  DiaryStateContext,
} from "./contexts/DiaryContext";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// const mockData = [
//   {
//     id: "mock1",
//     date: new Date().getTime() - 1,
//     content: "mock1",
//     emotionId: 1,
//   },
//   {
//     id: "mock2",
//     date: new Date().getTime() - 2,
//     content: "mock2",
//     emotionId: 2,
//   },
//   {
//     id: "mock3",
//     date: new Date().getTime() - 3,
//     content: "mock3",
//     emotionId: 3,
//   },
// ];

const createDiary = async (dispatch, action) => {
  const it = action.data;
  const { data, error } = await supabase
    .from("diary")
    .insert({
      date: new Date(it.date),
      content: it.content,
      emotionId: it.emotionId,
    })
    .select()
    .single();
  if (!error) {
    it.id = data.id;
    dispatch(action);
  }
};

const updateDiary = async (dispatch, action) => {
  const it = action.data;
  const { error } = await supabase
    .from("diary")
    .update([
      {
        ...it,
        date: new Date(it.date),
      },
    ])
    .eq("id", it.id);
  if (!error) {
    dispatch(action);
  }
};

const deleteDiary = async (dispatch, action) => {
  const { error } = await supabase
    .from("diary")
    .delete()
    .eq("id", action.targetId);
  if (!error) {
    dispatch(action);
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.data;
    case "CREATE":
      return [action.data, ...state];
    case "UPDATE":
      return state.map((it) =>
        String(it.id) === String(action.data.id) ? { ...action.data } : it
      );
    case "DELETE":
      return state.filter((it) => String(it.id) !== String(action.targetId));
    default:
      return state;
  }
}

const getDiary = async (callback) => {
  const { data } = await supabase.from("diary").select();
  if (data) {
    const diary = data.map((it) => ({
      ...it,
      date: new Date(it.date).getTime(),
    }));
    // console.log(diary);
    callback(diary);
  }
};

function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [data, dispatch] = useReducer(reducer, []);
  const idRef = useRef(0);

  const fetchData = async () => {
    const response = await fetch(
      "https://my-json-server.typicode.com/kbj0072/fakeDiary/diary"
    );
    const data = await response.json();

    // const response = await axios.get(
    //   "https://my-json-server.typicode.com/kbj0072/fakeDiary/diary"
    // );
    // const data = response.data;

    // const data = await ky
    //   .get("https://my-json-server.typicode.com/kbj0072/fakeDiary/diary")
    //   .json();

    dispatch({ type: "INIT", data: data });
    setIsDataLoaded(true);
  };

  useEffect(() => {
    // const rawData = localStorage.getItem("diary");
    // if (!rawData) {
    //   setIsDataLoaded(true);
    //   return;
    // }
    // const localData = JSON.parse(rawData);
    // if (localData.length === 0) {
    //   setIsDataLoaded(true);
    //   return;
    // }
    // localData.sort((a, b) => Number(b.id) - Number(a.id));
    // idRef.current = localData[0].id + 1;
    // dispatch({ type: "INIT", data: localData });
    // setIsDataLoaded(true);

    // fetchData();
    getDiary((diary) => {
      dispatch({ type: "INIT", data: diary });
      setIsDataLoaded(true);
    });
  }, []);

  const onCreate = (date, content, emotionId) => {
    createDiary(dispatch, {
      type: "CREATE",
      data: {
        id: idRef.current,
        date: new Date(date).getTime(),
        content,
        emotionId,
      },
    });
    idRef.current += 1;
  };

  const onUpdate = (targetId, date, content, emotionId) => {
    updateDiary(dispatch, {
      type: "UPDATE",
      data: {
        id: targetId,
        date: new Date(date).getTime(),
        content,
        emotionId,
      },
    });
  };

  const onDelete = (targetId) => {
    deleteDiary(dispatch, {
      type: "DELETE",
      targetId,
    });
  };

  if (!isDataLoaded) {
    return <div>데이터를 불러오는 중입니다</div>;
  } else {
    return (
      <DiaryStateContext value={data}>
        <DiaryDispatchContext
          value={{
            onCreate,
            onUpdate,
            onDelete,
          }}
        >
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new" element={<New />} />
              <Route path="/diary/:id" element={<Diary />} />
              <Route path="/edit/:id" element={<Edit />} />
            </Routes>
          </div>
        </DiaryDispatchContext>
      </DiaryStateContext>
    );
  }
}

export default App;
