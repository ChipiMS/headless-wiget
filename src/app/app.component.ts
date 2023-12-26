import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import SyncfyWidget from '@syncfy/authentication-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public credentials: string;
  public credentialsData;
  public headlessResults: any[] = [];
  public twofaData;
  public twofaFields;
  public showTwofaButton: boolean;
  private site;
  private twofa;

  public getCountries() {
    const { locale, token } = this.getInputs();

    SyncfyWidget.headless
      .getCountries({ token }, { locale })
      .then((countries) => {
        this.displayHeadlessResult(countries);
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  public getOrganizationSites(params?) {
    const { locale, token } = this.getInputs();

    SyncfyWidget.headless
      .getOrganizationSites({ token }, params, { locale })
      .then((organizationSites) => {
        this.displayHeadlessResult(organizationSites);
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  public getOrganizationTypes() {
    const { locale, token } = this.getInputs();

    SyncfyWidget.headless
      .getOrganizationTypes({ token }, { locale })
      .then((organizationTypes) => {
        this.displayHeadlessResult(organizationTypes);
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  public getSite() {
    const { locale, token } = this.getInputs(),
      id_site = (document.getElementById('id-site') as HTMLInputElement).value;

    SyncfyWidget.headless
      .getSite({ token }, id_site, { locale })
      .then((site) => {
        this.displayHeadlessResult(site);
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  public openRegularWidget() {
    const { locale, token } = this.getInputs(),
      widget = new SyncfyWidget({
        token,
        element: '#widget',
        config: {
          ...(locale ? { locale } : {}),
        },
      });
    widget.open();
  }

  public sendCredentials() {
    const data = JSON.parse(this.credentialsData);
    if (this.site.version === 1) {
      this.site.connect(data);
    } else {
      this.site.connect(0, data);
    }
  }

  public sendTwofa() {
    const data = JSON.parse(this.twofaData);
    this.twofa.authenticate(data);
  }

  public siteConnection() {
    const { locale, quickAnswer, socketTimeout, token } = this.getInputs(),
      id_site = (document.getElementById('id-site') as HTMLInputElement).value;
    SyncfyWidget.headless
      .getSite({ token }, id_site, { locale })
      .then((apiSite) => {
        SyncfyWidget.headless
          .siteConnection({ token }, apiSite, {
            locale,
            quickAnswer,
            socketTimeout,
          })
          .then((site) => {
            const version = site.version;
            this.site = site;
            this.displayHeadlessResult(site);
            this.displayHeadlessResult(site.version);
            setTimeout(() => {
              if (version === 3) {
                this.displayHeadlessResult(site.getOptions());
              }
            }, 1000);
            setTimeout(() => {
              if (version === 1) {
                this.displayCredentials(site.getFields());
              } else {
                this.displayCredentials(site.getFields(0));
              }
            }, 2000);
            site.on('twofa', () => {
              this.displayTwofa(site.twofa);
            });
            site.on('socket-message', (data) => {
              this.displayHeadlessResult(data);
            });
            site.on('socket-quick-answer', () => {
              this.displayHeadlessResult('Quick answer');
            });
            site.on('socket-timeout', () => {
              this.displayHeadlessResult('Socket timeout');
            });
          });
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  public syncCredential() {
    const { locale, quickAnswer, socketTimeout, token } = this.getInputs(),
      id_credential = (
        document.getElementById('id-credential') as HTMLInputElement
      ).value;
    SyncfyWidget.headless
      .syncCredential({ token }, id_credential, {
        locale,
        quickAnswer,
        socketTimeout,
      })
      .then((credential) => {
        credential.on('found', () => {
          this.displayHeadlessResult(credential.getCredentialData());
        });
        credential.on('twofa', () => {
          this.displayTwofa(credential.twofa);
        });
        credential.on('socket-message', (data) => {
          this.displayHeadlessResult(data);
        });
        credential.on('socket-quick-answer', () => {
          this.displayHeadlessResult('Quick answer');
        });
        credential.on('socket-timeout', () => {
          this.displayHeadlessResult('Socket timeout');
        });
      });
  }

  public testTwofa() {
    const { locale, token } = this.getInputs(),
      id_site = (document.getElementById('id-site') as HTMLInputElement).value;
    SyncfyWidget.headless
      .getSite({ token }, id_site, { locale })
      .then((apiSite) => {
        SyncfyWidget.headless
          .siteConnection({ token }, apiSite, {
            locale,
            quickAnswer: true,
          })
          .then((site) => {
            const version = site.version;
            this.site = site;
            if (version === 1) {
              this.displayCredentials(site.getFields());
            } else {
              this.displayCredentials(site.getFields(0));
            }
            site.on('socket-message', (data) => {
              if (data.code === 410) {
                SyncfyWidget.headless
                  .twofa({ token }, data, id_site, { locale })
                  .then((twofa) => {
                    this.displayTwofa(twofa);
                  });
              }
            });
            site.on('socket-quick-answer', () => {
              this.displayHeadlessResult(
                'Institution connected successfully with twofa'
              );
            });
          });
      })
      .catch((error) => {
        this.displayHeadlessResult(error);
      });
  }

  private displayCredentials(result: any) {
    this.credentials = result;
    this.credentialsData = JSON.stringify(
      result.reduce((object, field) => {
        return { ...object, [field.name]: '' };
      }, {})
    );
  }

  private displayHeadlessResult(result: any) {
    this.headlessResults.unshift(result);
  }

  private displayTwofa(twofa: any) {
    this.twofa = twofa;
    this.showTwofaButton = twofa.displaySubmitButton;
    this.twofaFields = twofa.getFields();
    this.twofaData = JSON.stringify(
      this.twofaFields.reduce((object, field) => {
        return { ...object, [field.name]: '' };
      }, {})
    );
    this.twofa.on('token-received', () => {
      this.twofaFields = twofa.getFields();
      this.twofaData = JSON.stringify(
        this.twofaFields.reduce((object, field) => {
          return { ...object, [field.name]: '' };
        }, {})
      );
    });
  }

  private getInputs() {
    var locale = (document.getElementById('locale') as HTMLInputElement).value,
      quickAnswer = (
        document.getElementById('quick-answer') as HTMLInputElement
      ).checked,
      socketTimeout = (
        document.getElementById('socket-timeout') as HTMLInputElement
      ).value,
      token = (document.getElementById('token') as HTMLInputElement).value;
    if (!token) {
      throw new Error('Invalid values');
    }

    if (locale && locale !== 'es' && locale !== 'en') {
      throw new Error('Invalid locale value');
    }
    return { locale, quickAnswer, socketTimeout, token };
  }
}
