import { useEffect, useState } from 'react';
import './App.css';
import Loading from './component/Loading';

function App() {
  const [list, setList] = useState([]);
  const [symbolsList, setSymbolsList] = useState(undefined);
  const [marketPrice, setMarketPrice] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const url = "https://api.delta.exchange/v2/products"
      fetch(url).then((res) => res.json()).then((response) => {
        setList(response.result)
        let tempArr = [];
        response.result.forEach(item => {
          marketPrice[item.id] = [0];
          tempArr.push(item.symbol)
        })
        setSymbolsList(tempArr)
        setLoading(false);
      });
    }
    fetchData();
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    var socket;
    const getData = () => {
      socket = new WebSocket('wss://production-esocket.delta.exchange')
      socket.onopen = () => {
        const msg = {
          type: "subscribe",
          channel: "v2/ticker",
          payload: {
            channels: [{
              name: "v2/ticker",
              symbols: symbolsList
            }]
          },
        }
        socket.send(JSON.stringify(msg))
      }
      socket.onmessage = (event) => {
        let temp = JSON.parse(event.data)
        let tempMarketPrice = { ...marketPrice }
        tempMarketPrice[temp.product_id] && (tempMarketPrice[temp.product_id][0] = temp.mark_price)
        setMarketPrice(tempMarketPrice)
      };
    }
    symbolsList && getData()
    // eslint-disable-next-line
  }, [symbolsList])


  return (
    <div className="container mt-3 mb-3">
      <h1 className="pb-2">List of Symbols</h1>
      {
        loading ? <Loading />
          :
          <table className="table table-striped">
            <thead className="table-header">
              <tr>
                <td>Symbol</td>
                <td>Description</td>
                <td>Underlying Asset</td>
                <td>Mark Price</td>
              </tr>
            </thead>
            <tbody>
              {
                list?.map(item => {
                  return (
                    <tr key={item.symbol}>
                      <td>{item.symbol}</td>
                      <td>{item.description}</td>
                      <td>{item.underlying_asset.symbol}</td>
                      <td>{marketPrice[item.id] && marketPrice[item.id][marketPrice[item.id]?.length - 1]}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>}
    </div>
  );
}

export default App;
