const Footer = () => {
  return (
    <footer className="flex justify-between gap-1 bg-white p-4 text-center text-white max-lg:flex-col">
     
      <p className="font-bold text-gray-300">
        POWERED BY{" "}
        <a
          href="https://saldoagency.com"
          target="_blank"
          className="hover:underline"
        >
          SALDO
        </a>
      </p>
      <p className="font-bold text-gray-300">
        WEBSITE CREATED WITH ♡ BY{" "}
        <a
          href="https://charisiss.gr"
          target="_blank"
          className="hover:underline"
        >
          CHARISISS
        </a>
      </p>
    </footer>
  );
};

export default Footer;
