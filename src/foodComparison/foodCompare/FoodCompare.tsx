import React, { useState } from "react";
import Creatable from "react-select/creatable";
import { ValueType } from "react-select";
import Menu, { isValidNewOption, OptionType } from "../menu/Menu";
import { createGroupedOptions, formatGroupLabel } from "../menu/options/Options";
import items from '../items.json'

interface Props {
  
}

const grouped = createGroupedOptions(items)

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const FoodCompare = (props: Props) => {
  const [selectedOption, setSelectedOption] = useState<ValueType<OptionType>>(null);

  return (
    <>
      <Creatable
        components={{ Menu }}
        isMulti
        isValidNewOption={() => false}
        options={grouped}
        // @ts-ignore
        formatGroupLabel={formatGroupLabel}
        onChange={(value: ValueType<OptionType>) => {
          console.error('@_changed', value);
          setSelectedOption(value);
        }}
      />
    </>
  );
};

export default FoodCompare;