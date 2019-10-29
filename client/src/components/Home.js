import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useMutation } from "@apollo/react-hooks";

import { ADD_OR_UPDATE_CRYPTOS } from "../graphql/mutations";

import Notification from "./Notification";
import Search from "./Search";
import TableData from "./TableData";
import Buttons from "./Buttons";

import halfCircleIcon from "../styles/imgs/Animated_loading_half-circle.gif";

const Home = ({ data: { allCryptos }, savedCryptos, loading }) => {
  const [filter, setFilter] = useState({ min: 1, max: 10 });
  const [search, setSearch] = useState("");
  const [cryptosToShow, setCryptosToShow] = useState([]);
  const [addOrUpdateCryptos] = useMutation(ADD_OR_UPDATE_CRYPTOS);

  useEffect(() => {
    if (loading) {
      // while api data is loading, render first 10 saved cryptos from database
      setCryptosToShow(
        savedCryptos.filter(
          crypto => crypto.rank >= filter.min && crypto.rank <= filter.max
        )
      );
    } else {
      // after loading completes, render api data
      setCryptosToShow(
        allCryptos.filter(crypto => {
          if (search) {
            return crypto.name.toLowerCase().includes(search.toLowerCase());
          }

          return crypto.rank >= filter.min && crypto.rank <= filter.max;
        })
      );

      // update first 10 cryptos in database
      const cryptosToSave = allCryptos
        .filter(crypto => crypto.rank <= 10)
        .map(crypto => {
          const { id, __typename, price_date, ...otherProps } = crypto;
          return otherProps;
        });

      addOrUpdateCryptos({ variables: { cryptosToSave } });
    }
  }, [allCryptos, loading, savedCryptos, search, filter, addOrUpdateCryptos]);

  return (
    <main className="content">
      <div className="home-content">
        <Notification />
        <Search search={search} setSearch={setSearch} />
        <h1 className="home-content__title heading-1">
          Current Top 10 Cryptocurrencies
        </h1>
        <div className="home-content__updating">
          {loading ? (
            <p>
              <img
                className="home-content__update-icon"
                src={halfCircleIcon}
                alt="updating icon"
              />
              <em> updating...</em>
            </p>
          ) : (
            <em>updated {allCryptos[0].price_date}</em>
          )}
        </div>
        <div className="home-content__content">
          <TableData cryptosToShow={cryptosToShow} />
          {loading ? null : (
            <Buttons
              filter={filter}
              setFilter={setFilter}
              allCryptos={allCryptos}
            />
          )}
        </div>
      </div>
    </main>
  );
};

const mapStateToProps = state => ({
  savedCryptos: state.savedCryptos,
  loading: state.loading
});

export default connect(mapStateToProps)(Home);
