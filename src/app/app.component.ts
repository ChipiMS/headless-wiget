import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as SyncfyWidget from '@syncfy/authentication-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public headlessResults: any[] = [];

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

  public siteConnection(version) {
    const { locale, quickAnswer, socketTimeout, token } = this.getInputs();
    SyncfyWidget.headless
      .siteConnection(
        { token },
        version === 1
          ? {
              id_site: '56cf5728784806f72b8b4568',
              id_site_type: '5b285177056f2911c13dbce1',
              is_business: 1,
              is_personal: 1,
              version: 1,
              name: 'Normal (Simple Auth)',
              credentials: [
                {
                  name: 'username',
                  required: true,
                  type: 'text',
                  label: 'User',
                  validation: null,
                  token: false,
                },
                {
                  name: 'password',
                  required: true,
                  type: 'password',
                  label: 'Password',
                  validation: null,
                  token: false,
                },
              ],
              endpoint: '/v1/credentials',
            }
          : {
              id_site: '5ae37e06056f290607126264',
              id_site_type: '5b285177056f2911c13dbce2',
              is_business: 1,
              is_personal: 1,
              version: 3,
              name: 'Acme Documents (v3)',
              input: [
                {
                  name: 'Default',
                  label: 'Default',
                  fields: [
                    {
                      name: 'reference',
                      required: true,
                      type: 'text',
                      label: 'Referencia',
                      validation: null,
                    },
                    {
                      name: 'contract',
                      required: true,
                      type: 'text',
                      label: 'Contrato',
                      validation: null,
                    },
                  ],
                },
              ],
              endpoint: '/v1/jobs',
            },
        { locale, quickAnswer, socketTimeout }
      )
      .then((site) => {
        this.displayHeadlessResult(site.version);
        setTimeout(() => {
          if (version === 3) {
            this.displayHeadlessResult(site.getOptions());
          }
        }, 1000);
        setTimeout(() => {
          if (version === 1) {
            this.displayHeadlessResult(site.getFields());
          } else {
            this.displayHeadlessResult(site.getFields(0));
          }
        }, 2000);
        setTimeout(() => {
          if (version === 1) {
            site.connect({ username: 'test', password: 'test' });
          } else {
            site.connect(0, { reference: 'test', contract: 'test' });
          }
        }, 3000);
        site.on('twofa', () => {
          this.displayHeadlessResult(site.twofa.getFields());
          site.twofa.authenticate({ token: 'test' });
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
          this.displayHeadlessResult(credential.twofa.getFields());
          credential.twofa.authenticate({ token: 'test' });
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

  public twofa() {
    const { locale, quickAnswer, socketTimeout, token } = this.getInputs();
    SyncfyWidget.headless
      .siteConnection(
        { token },
        {
          id_site: '56cf5728784806f72b8b4568',
          id_site_type: '5b285177056f2911c13dbce1',
          is_business: 1,
          is_personal: 1,
          version: 1,
          name: 'Normal (Simple Auth)',
          credentials: [
            {
              name: 'username',
              required: true,
              type: 'text',
              label: 'User',
              validation: null,
              token: false,
            },
            {
              name: 'password',
              required: true,
              type: 'password',
              label: 'Password',
              validation: null,
              token: false,
            },
          ],
          endpoint: '/v1/credentials',
        },
        { locale, quickAnswer: true, socketTimeout }
      )
      .then((site) => {
        site.connect({ username: 'test', password: 'test' });
        site.on('socket-message', (data) => {
          if (data.code === 410) {
            SyncfyWidget.headless
              .twofa({ token }, data, { locale })
              .then((twofa) => {
                this.displayHeadlessResult(twofa.getFields());
                twofa.authenticate({ token: 'test' });
              });
          }
        });
        site.on('socket-quick-answer', () => {
          this.displayHeadlessResult(
            'Institution connected successfully with twofa'
          );
        });
      });
  }

  private displayHeadlessResult(result: any) {
    this.headlessResults.push(result);
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
