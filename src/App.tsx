import React from "react";
import { Router, Route, Link } from "react-router-dom";
import { createBrowserHistory } from "history";

import Sudoku from "./sudoku/Sudoku";
import FoodCompare from "./foodComparison/foodCompare/FoodCompare";
import IndexPage from "./indexPage/IndexPage";

import "./App.css";

const history = createBrowserHistory();
const ROOT_BODY_CLASS = "index";

export const setBodyClassNameToRoute = () => {
  document.querySelector("body")?.removeAttribute("class");
  const pathname = window.location.pathname.split("/")[1] || ROOT_BODY_CLASS;
  document.querySelector("body")?.classList?.add(pathname);
};

setBodyClassNameToRoute();
history.listen(setBodyClassNameToRoute);

const projects = [
  {
    thumb: `${process.env.PUBLIC_URL}projects/food-compare.jpg`,
    title: "Food Comparison tool",
    caption: (
      <p>
        Compare fruits and vegetables nutrient composition: Leveraging the{" "}
        <a href="https://developer.nutritionix.com/">Nutritionix API</a> D3.js
        and react-select
      </p>
    ),
    link: "/foodCompare",
  },
  {
    thumb: `${process.env.PUBLIC_URL}projects/sudoku.jpg`,
    title: "Sudoku",
    caption:
      "The classic logic based puzzle; utilizing React Hooks and a backtracking algorythm to genereate puzzles of different difficulty. Dark and light modes using CSS variables.",
    link: "/sudoku",
  },
];

const Index = () => (
  // @ts-ignore
  <IndexPage projects={projects} />
  // <ul>
  //   <li>
  //     <Link to="/sudoku">Sudoku</Link>
  //   </li>
  //   <li>
  //     <Link to="/foodCompare">Food Comparison</Link>
  //   </li>
  // </ul>
);

export const App = () => {
  return (
    <Router history={history}>
      <Route exact path="/" component={Index} />
      <Route path="/sudoku" component={Sudoku} />
      <Route path="/foodCompare" component={FoodCompare} />
    </Router>
  );
};
