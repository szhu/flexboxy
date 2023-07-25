import React from "react";
import { css, cx } from "@emotion/css";

// <Stack x>
// <Stack x="center" y="stretch" />
// <Stack x="4px center 4px" y="stretch" />
// <Stack x="4px center 4px" y="4px stretch" />
// <Stack x="4px 5px center 4px" y="4px 6px stretch" />

type CssLength = `${number}px` | `${number}rem` | "0";
type Padding = CssLength;
type PaddingShorthand = Padding | `${Padding} ${Padding}`;
type Gap = CssLength;
type Alignment = "stretch" | "center" | "start" | "end";

type FlexAxisSpec =
  | `${PaddingShorthand} ${Alignment} ${Gap}`
  | `${PaddingShorthand} ${Alignment}`
  | `${PaddingShorthand} ${Gap}`
  | `${Alignment} ${Gap}`
  | `${Alignment}`
  | `${Gap}`
  | true;

type FlexProps = {
  x?: FlexAxisSpec;
  y?: FlexAxisSpec;
} & (
  | { x: FlexAxisSpec; y?: FlexAxisSpec }
  | { y: FlexAxisSpec; x?: FlexAxisSpec }
);

interface FlexAxisStyle {
  padding: [string, string];
  alignment: string | undefined;
  gap: string | undefined;
}

const DefaultParsedAxisValue: FlexAxisStyle = {
  padding: ["0", "0"],
  alignment: undefined,
  gap: undefined,
};

function getWordType(word: string) {
  return word.match(/\d/) ? "length" : "keyword";
}

function parseAxisSpec(value: FlexAxisSpec | undefined): FlexAxisStyle {
  if (typeof value !== "string") return DefaultParsedAxisValue;

  let tokens = value.split(/\s+/);
  let typeString = tokens.map(getWordType).join(" ");

  if (typeString === "keyword") {
    let [alignment] = tokens;
    return { ...DefaultParsedAxisValue, alignment };
  } else if (typeString === "length keyword") {
    let [padding, alignment] = tokens;
    return {
      ...DefaultParsedAxisValue,
      padding: [padding, padding],
      alignment,
    };
  } else if (typeString === "length keyword length") {
    let [padding, alignment, gap] = tokens;
    return {
      ...DefaultParsedAxisValue,
      padding: [padding, padding],
      alignment,
      gap,
    };
  } else if (typeString === "length length keyword") {
    let [paddingStart, paddingEnd, alignment] = tokens;
    return {
      ...DefaultParsedAxisValue,
      padding: [paddingStart, paddingEnd],
      alignment,
    };
  } else if (typeString === "length length keyword length") {
    let [paddingStart, paddingEnd, alignment, gap] = tokens;
    return {
      ...DefaultParsedAxisValue,
      padding: [paddingStart, paddingEnd],
      alignment,
      gap,
    };
  } else if (typeString === "keyword length") {
    let [alignment, gap] = tokens;
    return { ...DefaultParsedAxisValue, alignment, gap };
  } else if (typeString === "length") {
    let [gap] = tokens;
    return { ...DefaultParsedAxisValue, gap };
  } else if (typeString === "length length") {
    let [padding, gap] = tokens;
    return { ...DefaultParsedAxisValue, padding: [padding, padding], gap };
  } else if (typeString === "length length length") {
    let [paddingStart, paddingEnd, gap] = tokens;
    return {
      ...DefaultParsedAxisValue,
      padding: [paddingStart, paddingEnd],
      gap,
    };
  } else {
    console.error("Couldn't parse axis value:", value);
    return DefaultParsedAxisValue;
  }
}

function parseFlexProps(props: FlexProps) {
  const xProps = parseAxisSpec(props.x);
  const yProps = parseAxisSpec(props.y);

  const keys = Object.keys(props);
  let xIndex = keys.indexOf("x");
  if (xIndex < 0) xIndex = Infinity;

  let yIndex = keys.indexOf("y");
  if (yIndex < 0) yIndex = Infinity;

  const primaryAxis = xIndex < yIndex ? "x" : "y";
  const flexDirection = primaryAxis === "x" ? "row" : "column";
  const primaryAxisProps = primaryAxis === "x" ? xProps : yProps;
  const secondaryAxisProps = primaryAxis === "x" ? yProps : xProps;

  let [paddingTop, paddingBottom] = yProps.padding;
  let [paddingLeft, paddingRight] = xProps.padding;
  let justifyContent = primaryAxisProps.alignment;
  let alignItems = secondaryAxisProps.alignment;

  let gap: string | undefined = undefined;
  if (primaryAxisProps.gap && !secondaryAxisProps.gap) {
    gap = primaryAxisProps.gap;
  } else if (secondaryAxisProps.gap) {
    if (!primaryAxisProps.gap) {
      primaryAxisProps.gap = "0";
    }
    gap = [yProps.gap, xProps.gap].join(" ");
  }

  return {
    display: "flex",
    flexDirection,
    alignItems,
    justifyContent,
    padding: [paddingTop, paddingRight, paddingBottom, paddingLeft].join(" "),
    gap,
  };
}

const Flex: React.FC<
  FlexProps & {
    children?: React.ReactNode;
    className?: string;
    debug?: boolean;
    flex?: string;
    inline?: boolean;
    wrap?: boolean;
  }
> = (props) => {
  let flexStyle = parseFlexProps(props as any);
  return (
    <div
      className={cx(
        css`
          outline: ${props.debug && "2px dashed #ff00ff40"};
          box-shadow: ${props.debug && "inset 0 0 20px 7px #ff00ff40"};

          flex: ${props.flex};

          display: ${props.inline ? "inline-flex" : "flex"};
          flex-wrap: ${props.wrap && "wrap"};
          flex-direction: ${flexStyle.flexDirection};
          align-items: ${flexStyle.alignItems};
          justify-content: ${flexStyle.justifyContent};
          padding: ${flexStyle.padding};
          gap: ${flexStyle.gap};
        `,
        props.className
      )}
    >
      {props.children}
    </div>
  );
};

export default Flex;
