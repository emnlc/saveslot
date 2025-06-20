type Props = {
  classes: string;
};

const Nintendo = ({ classes }: Props) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130 100"
        fill="currentColor"
        className={classes}
      >
        <path
          d="M50,100a50,50 0 0 1 0,-100 h 30 a50,50 0 0 1 0,100zM50,87.5 a 37.5,37.5 0 0 1 0,-75 h 30 a 37.5,37.5 0 0 1 0,75z"
          fillRule="evenodd"
        />
        <path d="M40.235,26.455h14.68l20.3,32.83v-32.83h14.55v47.09h-14.54l-20.39,-32.84v32.84h-14.59 z" />
      </svg>
    </>
  );
};

export default Nintendo;
