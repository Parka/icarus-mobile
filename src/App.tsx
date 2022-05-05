import { Redirect, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import { Zeroconf } from '@awesome-cordova-plugins/zeroconf'
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [servers, setServers] = useState<string[]>([]);

  useEffect(()=>{
    Zeroconf.watch('_http._tcp.', 'local.').subscribe(result => {
      let ip = result.service.ipv4Addresses[0];
      let port = result.service.port;
      let url = `http://${ip}:${port}`;
      
      if (result.action == 'added') {
        console.log('service added', result.service);
      }
      else if (result.action == 'resolved') {
          console.log('service resolved', result.service);
          if(servers.indexOf(url) === -1)  {
            setServers([...servers, url])
          }
      } else {
        console.log('service removed', result.service);
      }
    });
  },[])

  useEffect(()=>{
    if(servers[0]){
      const browserRef = InAppBrowser.create(servers[0], '_self', {
        location: 'no',
        zoom: 'no',
      })
      browserRef.on('exit').subscribe( () =>
        ScreenOrientation.unlock()
      )
      ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.LANDSCAPE)
    }
  },[servers])

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
};

export default App;
