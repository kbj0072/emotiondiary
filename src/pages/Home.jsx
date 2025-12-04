import Header from "../components/Header";
import Button from "../components/Button";
import { useContext, useEffect, useState } from "react";
import { DiaryStateContext } from "../contexts/DiaryContext";
import { getMonthRangeByDate, setPageTitle } from "../util";
import DiaryList from "../components/DiaryList";

const Home = () => {
  const data = useContext(DiaryStateContext);
  const [pivotDate, setPivotDate] = useState(new Date());
  const [filteredData, setFilterdData] = useState([]);

  const headerTitle = `${pivotDate.getFullYear()}년 ${
    pivotDate.getMonth() + 1
  }월`;
  const onIncreaseMonth = () =>
    setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1));

  const onDecreaseMonth = () =>
    setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1));

  useEffect(() => {
    setPageTitle("bjkim의 감정 일기장");
  }, []);

  useEffect(() => {
    if (data.length >= 1) {
      const { beginTimeStamp, endTimeStamp } = getMonthRangeByDate(pivotDate);
      setFilterdData(
        data.filter(
          (it) => beginTimeStamp <= it.date && it.date <= endTimeStamp
        )
      );
    } else {
      setFilterdData([]);
    }
  }, [data, pivotDate]);

  return (
    <div>
      <Header
        title={headerTitle}
        leftChild={<Button text={"<"} onClick={onDecreaseMonth} />}
        rightChild={<Button text={">"} onClick={onIncreaseMonth} />}
      />
      <DiaryList data={filteredData} />
    </div>
  );
};
export default Home;
