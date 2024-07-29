// tableStyles.js

export const getTableStyles = (colorMode: string) => ({
  "th, td": {
    borderBottom: "1px solid",
    borderColor: colorMode === "light" ? "gray.200" : "gray.700",
    padding: "8px",
  },
  th: {
    backgroundColor: colorMode === "light" ? "gray.100" : "gray.900",
    color: colorMode === "light" ? "gray.800" : "gray.100",
  },
  tr: {
    "&:nth-of-type(even)": {
      backgroundColor: colorMode === "light" ? "gray.50" : "gray.800",
    },
  },
  "tr:hover": {
    backgroundColor: colorMode === "light" ? "gray.200" : "gray.700",
  },
});


export const formControlStyles = {
  width: "200px",
};

export const formLabelStyles = (colorMode: string, theme: any) => ({
  mb: 2,
  color: colorMode === "dark" ? theme.colors.white : theme.colors.gray[700],
});

export const menuButtonStyles = (colorMode: string, theme: any) => ({
  bg: colorMode === "dark" ? theme.colors.gray[800] : theme.colors.gray[100],
  borderColor: colorMode === "dark" ? theme.colors.gray[600] : theme.colors.gray[300],
  _hover: {
    borderColor: colorMode === "dark" ? theme.colors.gray[500] : theme.colors.gray[400],
    bg: colorMode === "dark" ? theme.colors.gray[700] : theme.colors.gray[200],
  },
  _active: {
    bg: colorMode === "dark" ? theme.colors.gray[600] : theme.colors.gray[300],
  },
  borderWidth: "1px",
  borderRadius: "md",
  textAlign: "left",
  width: "100%",
  color: colorMode === "dark" ? theme.colors.white : theme.colors.gray[700],
});

export const menuListStyles = (colorMode: string, theme: any) => ({
  bg: colorMode === "dark" ? theme.colors.gray[800] : theme.colors.white,
  borderColor: theme.colors.gray[300],
  borderWidth: "1px",
  borderRadius: "md",
  boxShadow: "md",
  maxH: "300px",
  overflowY: "auto",
});

export const menuItemStyles = (colorMode: string, theme: any) => ({
  _hover: {
    bg: colorMode === "dark" ? theme.colors.gray[600] : theme.colors.gray[100],
  },
  color: colorMode === "dark" ? theme.colors.white : theme.colors.gray[700],
});