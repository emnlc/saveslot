import Games from "./Sections/Games";

interface Props {
  search: { filter?: string };
  navigate: (options: {
    search: { filter: string };
    replace?: boolean;
  }) => void;
}

const UserGames = ({ search, navigate }: Props) => {
  return (
    <>
      <div className="my-12">
        <Games search={search} navigate={navigate} />
      </div>
    </>
  );
};

export default UserGames;
