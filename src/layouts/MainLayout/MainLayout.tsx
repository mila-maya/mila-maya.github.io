import { Outlet } from 'react-router-dom';
import Header from '@components/common/Header/Header';
import Footer from '@components/common/Footer/Footer';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
