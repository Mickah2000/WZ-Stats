import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ElasticService } from 'app/services/elastic_api.service';
import "tailwindcss/tailwind.css"

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexTitleSubtitle,
} from "ng-apexcharts";
import { FormControl, FormGroup } from '@angular/forms';

import tableConvert from 'app/countries/tableconvert_json_sbk1wd.json';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
};

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls  : ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DashboardComponent implements OnInit, OnDestroy {
    @ViewChild("chart") chart: ChartComponent;
    chartOptions: Partial<ApexOptions>;           // 1st graphic
    chartSmsByItemType: Partial<ApexOptions>;    // 2nd graphic
    chartSmsStats: Partial<ApexOptions>;        // 3rd graphic
    _isLoaded: boolean = false;     // 1st graphic
    _isLoaded2: boolean = false;    // 2nd graphic
    _isLoaded3: boolean = false;    // 3rd graphic

    myDatepicker: any;
    range = new FormGroup({
        start: new FormControl(),
        end: new FormControl()
    });

    filter = {
        tls_slug: '',
        domain_id: '',
        user_id: ''
    };
    xaxis = {
        min: null,
        max: null
    };

    smsStatsDisplay = {
        nb_success: null,
        nb_fails: null,
        percent_success: null,
        percent_fails: null
    }

    smsTypesDisplay = {
        rdv_success: null,
        msg_success: null,
        notify_success: null,
        percent_rdv: null,
        percent_msg: null,
        percent_notify: null
    }

    // TLS suggestion controls
    myTlsControl = new FormControl();
    myDomainControl = new FormControl();
    myUserControl = new FormControl();
    filteredTlsOptions: Observable<string[]>;
    filteredDomainsOptions: Observable<string[]>;
    filteredUsersOptions: Observable<string[]>;
    tlsSlugList: any[];
    domainIdList: any[];
    userIdList: any[];

    chartVisitors: ApexOptions;
    chartConversions: ApexOptions;
    chartImpressions: ApexOptions;
    chartVisits: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    chartNewVsReturning: ApexOptions;
    chartGender: ApexOptions;
    chartAge: ApexOptions;
    chartLanguage: ApexOptions;
    data: any;

    // Google maps
    lat = 43.9222;
    lng = 2.16596;
    googleMapType = 'roadmap';
    markers: any[] = []
    latitude: number;
    longitude: number;
    zoom: number = 1;

    // checkboxes
    mapShowOverlays = {
        success: true,
        fails: true
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _elasticAPI : ElasticService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.myDomainControl.disable();
        this.myUserControl.disable();
        // Search TLS
        this._getList("tls_slug")
            .then((tlsList) => {
                console.log('tlsList :', tlsList);

                this.tlsSlugList = tlsList;

                // set autocomplete for TLS
                this.filteredTlsOptions = this.myTlsControl.valueChanges
                    .pipe(
                        startWith(''),
                        map(value => this._filter(value, this.tlsSlugList))
                    );

            })
            .catch()
            .finally();

        // Search data and display chart
        this._searchAndDisplay();

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     * Search data and display chart
     * 
     * @param event : template event
     */
    onInputChange(event: Event): void {
        console.log('event: ', event);

        this._searchAndDisplay();
    }

    /**
     * Method for date range
     * 
     * @param event 
     */
    dateChange(event: Event): void {
        console.log('date start: ', this.range.value.start);
        console.log('date end: ', this.range.value.end);

        // Conversion des dates en timestamp
        let startDate = new Date(this.range.value.start).getTime();
        let endDate = new Date(this.range.value.end).getTime();

        console.log(startDate, endDate)

        let x_axis_obj = { min: startDate, max: endDate };

        this._searchAndDisplay(x_axis_obj);

    }

    /**
     * Method for select TLS
     * 
     * @param event 
     */
    selectedClient(event: MatAutocompleteSelectedEvent, type: string) {
        console.log('sélectionné :', event);
        console.log('type :', type);

        this.myDomainControl.enable();

        switch (type) {
            case 'tls_slug':
                this.filter.tls_slug = event.option.value; // Stores the value in filter

                // Activate the domain field and delete it if it is already filled
                this.myDomainControl.reset();
                this.myDomainControl.enable();
                // Disable the user field, since we just selected a tls (and delete it too)
                this.myUserControl.reset();
                this.myUserControl.disable();
                // Delete filter variables that are not tls_slug
                this.filter.domain_id = '';
                this.filter.user_id = '';

                // Search Domain_ids
                this._getList("domain_id")
                    .then((domainIdList) => {
                        domainIdList = domainIdList.map(x => x.toString());
                        console.log('domainIdList :', domainIdList);

                        this.domainIdList = domainIdList;

                        // autocomplete for TLS
                        this.filteredDomainsOptions = this.myDomainControl.valueChanges

                            .pipe(
                                startWith(''),
                                map(value => this._filter(value, this.domainIdList))
                            );
                    })
                    .catch()
                    .finally();
                break;
            case 'domain_id':
                this.filter.domain_id = event.option.value;
                this.myUserControl.reset();
                this.myUserControl.enable();
                // Users _ids
                this._getList("user_id")
                    .then((userIdList) => {
                        userIdList = userIdList.map(x => x.toString());
                        console.log('userIdList :', userIdList);

                        this.userIdList = userIdList;

                        // set autocomplete for TLS
                        this.filteredUsersOptions = this.myUserControl.valueChanges

                            .pipe(
                                startWith(''),
                                map(value => this._filter(value, this.userIdList))
                            );

                    })
                    .catch()
                    .finally();
                break;
            case 'user_id':
                this.filter.user_id = event.option.value;
                break;
        }

        this._searchAndDisplay();
    }

    toggleButton(event) {
        console.log('Bouton cliqué :', event.value);
        this.loadButtonAction(event.value);
    }

    iconButton(value: string) {
        console.log('Bouton cliqué : ', value)
        this.loadButtonAction(value);
    }

    loadButtonAction(value) {
        let now = Date.now(); // timestamp
        let today: Date = new Date();
        let oneHour: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() - 1, today.getMinutes())
        let oneDay: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, today.getHours(), today.getMinutes())
        let oneWeek: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, today.getHours(), today.getMinutes())
        let oneMonth: Date = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate(), today.getHours(), today.getMinutes())

        switch (value) {
            case 'oneHour':
                this.xaxis = {
                    min: oneHour.getTime(), // getTime() : convert the Date object to a timestamp
                    max: now
                };
                break;
            case 'oneDay':
                this.xaxis = {
                    min: oneDay.getTime(),
                    max: now
                };
                break;
            case 'oneWeek':
                this.xaxis = {
                    min: oneWeek.getTime(),
                    max: now
                };
                break;
            case 'oneMonth':
                this.xaxis = {
                    min: oneMonth.getTime(),
                    max: now
                };
                break;
        }
        this._searchAndDisplay(this.xaxis)
    }

    setCheckbox(checked: boolean, type:string){
        this.mapShowOverlays[type] = checked;        
    } 

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
*
* Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
*
* @param element
* @private
*/
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }


    /**
     * Prepare the chart data from the data
     * 
     * @param smsSuccessData
     */
    private _prepareSmsData(smsSuccessData: any, smsFailData: any, x_axis_range: number[], interval?: string): void {
        console.log('smsSuccessData :', smsSuccessData);

        // set values for template
        this.smsStatsDisplay.nb_success = smsSuccessData.hits.total.value;
        this.smsStatsDisplay.nb_fails = smsFailData.hits.total.value;
        this.smsStatsDisplay.percent_success = ((smsSuccessData.hits.total.value / (smsSuccessData.hits.total.value + smsFailData.hits.total.value)) * 100).toFixed(1);
        this.smsStatsDisplay.percent_fails = ((smsFailData.hits.total.value / (smsFailData.hits.total.value + smsSuccessData.hits.total.value)) * 100).toFixed(1);

        let xySuccessData = smsSuccessData.aggregations.myDateHistogram.buckets.map(val => { return { x: new Date(val.key), y: val.doc_count } });
        let xyFailData = smsFailData.aggregations.myDateHistogram.buckets.map(val => { return { x: new Date(val.key), y: val.doc_count } });

        let currentDate = new Date();
        console.log(currentDate.getTime());
        console.log('xy_data :', xySuccessData);
        console.log('x_axis_range :', x_axis_range);

        console.info('interval => ', (interval ? interval : ''));

        // The config and data of the graphic
        this.chartOptions = {
            series: [
                {
                    name: 'Success ' + (interval ? interval : ''),
                    data: xySuccessData
                },
                {
                    name: 'Fail ' + (interval ? interval : ''),
                    data: xyFailData,
                    color: '#fc7f03'
                },
            ],
            chart: {
                id: 'smsChart',
                height: 350,
                stacked: true,
                type: "bar",
                events: {
                    zoomed: (chartContext, { xaxis, yaxis }) => {
                        console.log('user zoomed => ', chartContext, { xaxis, yaxis });
                        console.log('x_axis_range => ', x_axis_range);
                        // Checker si on a dézoomé en dehors du range
                        if (xaxis.min < x_axis_range[0] || xaxis.max > x_axis_range[1]) {// si dézoom en dehors le range
                            console.log('on est dans le IF !!');
                            this._searchAndDisplay(xaxis);
                        } else {
                            console.log('on n\'est dans le else !!');
                        }

                    }
                }
            },
            title: {
                text: "Nombre de sms"
            },
            xaxis: {
                type: 'datetime'
            },
        };

        this._isLoaded = true;
        console.log('chartOptions -> ', this.chartOptions);
    }

    private _prepareDetailedSmsData(smsItemsRdv: any, smsItemsMsg: any, smsItemsNotif: any): void {

        this.smsTypesDisplay.rdv_success = smsItemsRdv.hits.total.value;
        this.smsTypesDisplay.msg_success = smsItemsMsg.hits.total.value;
        this.smsTypesDisplay.notify_success = smsItemsNotif.hits.total.value;
        this.smsTypesDisplay.percent_rdv = ((smsItemsRdv.hits.total.value / (smsItemsMsg.hits.total.value + smsItemsRdv.hits.total.value + smsItemsNotif.hits.total.value)) * 100).toFixed(1);
        this.smsTypesDisplay.percent_msg = ((smsItemsMsg.hits.total.value / (smsItemsMsg.hits.total.value + smsItemsRdv.hits.total.value + smsItemsNotif.hits.total.value)) * 100).toFixed(1);
        this.smsTypesDisplay.percent_notify = ((smsItemsNotif.hits.total.value / (smsItemsMsg.hits.total.value + smsItemsRdv.hits.total.value + smsItemsNotif.hits.total.value)) * 100).toFixed(1);

    }

    private _getList(term: string): Promise<any> {

        let buckets: any[];

        let searchParams;

        switch (term) {
            case 'tls_slug':
                searchParams = {
                    index: 'sms.*',
                    body: {
                        "aggs": {
                            "distinct_data": {
                                "terms": { "field": "tls_slug.keyword", "size": 500 },
                            }
                        },
                        "size": 0,
                    }
                };
                break;
            case 'domain_id':
                searchParams = {
                    index: 'sms.*',
                    body: {
                        "query": {
                            "bool": {
                                "must": [
                                    { "match": { "tls_slug": this.filter.tls_slug.toLocaleUpperCase() } }

                                ]
                            }
                        },
                        "aggs": {
                            "distinct_data": {
                                "terms": { "field": "domain_id", "size": 500 },
                            }
                        },
                        "size": 0,
                    }
                };
                break;
            case 'user_id':
                searchParams = {
                    index: 'sms.*',
                    body: {
                        "query": {
                            "bool": {
                                "must": [
                                    { "match": { "tls_slug": this.filter.tls_slug.toLocaleUpperCase() } },
                                    { "match": { "domain_id": this.filter.domain_id.toLocaleUpperCase() } }
                                ]
                            }
                        },
                        "aggs": {
                            "distinct_data": {
                                "terms": { "field": "user_id", "size": 500 },
                            }
                        },
                        "size": 0,
                    }
                };
                break;
        }
        console.log('_getList searchParams :', searchParams);

        return new Promise((resolve, reject) => {

            this._elasticAPI.search(searchParams)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((successTLS: any) => {
                    console.log('TLSSSS:', successTLS);
                    buckets = successTLS.result.body.aggregations.distinct_data.buckets.map(val => val.key);
                    console.log('TLSSSS 2:', buckets);
                    resolve(buckets);
                    return;
                }, (error: any) => {
                    reject(error);
                }
                );
        });
    }

    private _searchAndDisplay(xaxis?: any): void {
        console.log('xaxis : ', xaxis);

        // Si le xaxis est renseigné (c'est un param optionnel à cause du ? )
        // alors on le stocke
        if (xaxis)
            this.xaxis = xaxis;

        let timestampNow: number;
        let dateNow: Date = new Date();
        let fixed_interval: string = "60s";
        let dateOneWeekAgo: Date;
        let dateOneDayAgo: Date;
        let dateOneHourAgo: Date;
        let dateSixHourAgo: Date;

        dateOneDayAgo = new Date();
        dateOneDayAgo.setDate(dateNow.getDate() - 1);

        let min_x_axis;
        let max_x_axis;


        if (this.xaxis.min && this.xaxis.max) {

            min_x_axis = this.xaxis.min;
            max_x_axis = this.xaxis.max;
        } else { // aucune date renseignée
            timestampNow = Date.now();

            // date il y a une sem
            dateOneWeekAgo = new Date();
            dateOneWeekAgo.setDate(dateNow.getDate() - 7);

            // date il y a 1 jour + conversion en TS :
            dateOneDayAgo = new Date();
            dateOneDayAgo.setDate(dateNow.getDate() - 1);

            // date il y a 1 heure + conversion en TS :
            dateOneHourAgo = new Date();
            dateOneHourAgo.setDate(dateNow.getHours() - 1);

            dateSixHourAgo = new Date();
            dateSixHourAgo.setDate(dateNow.getHours() - 6);

            min_x_axis = new Date().setDate(dateNow.getDate() - 1);
            max_x_axis = new Date().getTime();
        }

        // Calculer la durée
        let duration = max_x_axis - min_x_axis;

        console.log('durée:', duration);
        switch (true) {
            case (duration <= 3600000):
                console.warn("less than 1h");
                // ici on change le fixed_interval pour une durée de moins d'une h
                fixed_interval = "60s"; // (intervalle d'une minute pour une durée de moins d'une heure)
                break;
            case (duration <= 86400000):
                console.warn("between 1h and 1j");
                // ici on change le fixed_interval pour une durée de une h à un jour
                fixed_interval = "1800s"; // (intervalle de 30 minutes pour une durée de une heure à un jour)
                break;
            case (duration <= 2600000000):
                console.warn("between 1j and 1m");
                // ici on change le fixed_interval pour une durée de un jour à un mois
                fixed_interval = "21600s"; // (intervalle de 6 heures pour une durée de un jour à un mois)
                break;
            case (duration <= 31000000000):
                console.warn("between 1m and 1y");
                // ici on change le fixed_interval pour une durée de un mois à un an
                fixed_interval = "86400s"; // intervalle de 1 jour pour une durée de un mois à un an
                break;
            case (duration > 31000000000):
                // ici on change le fixed_interval pour une durée de plus d'un an
                fixed_interval = "2600000s"; // intervalle de 1 mois pour une durée de plus d'un an

                console.log("more than 1 year");
                break;
            default:
                fixed_interval = "60s";

                console.log("autre cas", duration);
                break;

        }
        console.warn("fixed_interval = " + fixed_interval);

        console.info('TS now :', new Date());

        console.log('min_x_axis :', min_x_axis);
        console.log('max_x_axis :', max_x_axis);
        console.log('dateOneWeekAgo :', dateOneWeekAgo);

        let searchParams = {
            index: 'sms.*',
            body: {
                "query": {
                    "bool": {
                        "must": []
                    }
                },
                "size": 0,
                "aggregations": {
                    "myDateHistogram": {
                        "date_histogram": {
                            "field": "timestamp",
                            "fixed_interval": fixed_interval
                        }
                    }
                }
            }
        };

        let filter: any[];
        if (this.filter.tls_slug !== '' && this.filter.domain_id == '' && this.filter.user_id == '') {
            filter = [
                { "match": { "tls_slug": this.filter.tls_slug.toLocaleUpperCase() } },  // transformer tls_slug en MAJ
                {
                    "range": {
                        "timestamp": {
                            "gte": min_x_axis,
                            "lte": max_x_axis
                        }
                    }
                }
            ];
        } else if (this.filter.domain_id !== '' && this.filter.domain_id !== '' && this.filter.user_id == '') {
            filter = [
                { "match": { "tls_slug": this.filter.tls_slug.toLocaleUpperCase() } },
                { "match": { "domain_id": this.filter.domain_id.toLocaleUpperCase() } },
                {
                    "range": {
                        "timestamp": {
                            "gte": min_x_axis,
                            "lte": max_x_axis
                        }
                    }
                }
            ];
        } else if (this.filter.domain_id !== '' && this.filter.domain_id !== '' && this.filter.user_id !== '') {
            filter = [
                { "match": { "tls_slug": this.filter.tls_slug.toLocaleUpperCase() } },
                { "match": { "domain_id": this.filter.domain_id.toLocaleUpperCase() } },
                { "match": { "user_id": this.filter.user_id.toLocaleUpperCase() } },
                {
                    "range": {
                        "timestamp": {
                            "gte": min_x_axis,
                            "lte": max_x_axis
                        }
                    }
                }
            ];
        } else {
            filter = [
                {
                    "range": {
                        "timestamp": {
                            "gte": min_x_axis,
                            "lte": max_x_axis
                        }
                    }
                }
            ];
        }

        searchParams.body.query.bool.must = filter;

        console.log('searchParams :', searchParams);

        searchParams.index = "sms.success";


        // Get the success data
        this._elasticAPI.search(searchParams) // 1st requete
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((smsSuccessData: any) => {    // result

                console.log('Success Data :', smsSuccessData);

                // 2nd req for fail sms
                searchParams.index = "sms.fail";
                this._elasticAPI.search(searchParams)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((smsFailData: any) => {

                        console.log('Fail Data :', smsFailData);

                        // // Prepare the chart data
                        this._prepareSmsData(smsSuccessData.result.body, smsFailData.result.body, [min_x_axis, max_x_axis]);  // 

                        this._prepareMapsData([min_x_axis, max_x_axis]);
                    });
            });

        const searchByItemTypeParams = JSON.parse(JSON.stringify(searchParams));
        searchByItemTypeParams.index = "sms.*"; // All in SMS Index

        const save_must = searchParams.body.query.bool.must;

        // 1 object for each search
        let searchByRdvTypeParams = JSON.parse(JSON.stringify(searchByItemTypeParams));
        let searchByNotifyTypeParams = JSON.parse(JSON.stringify(searchByItemTypeParams));
        let searchByMsgTypeParams = JSON.parse(JSON.stringify(searchByItemTypeParams));

        searchByRdvTypeParams.body.query.bool.must.push({ "match": { "data.related_item_type": "rdv" } });
        searchByNotifyTypeParams.body.query.bool.must.push({ "match": { "data.related_item_type": "notification" } });
        searchByMsgTypeParams.body.query.bool.must.push({ "match": { "data.related_item_type": "msg" } });

        console.log('searchByRdvTypeParams :', searchByRdvTypeParams.body.query.bool.must);
        console.log('searchParams2 :', searchParams);

        this._elasticAPI.search(searchByMsgTypeParams) // 1st requete
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((smsItemsMsg: any) => {    // result

                console.log('smsItemsMsg :', smsItemsMsg.result.body);

                // 2nd requete 
                this._elasticAPI.search(searchByRdvTypeParams)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((smsItemsRdv: any) => {

                        console.log('smsItemsRdv :', smsItemsRdv.result.body);

                        // 3rd requete 
                        this._elasticAPI.search(searchByNotifyTypeParams)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((smsItemsNotif: any) => {

                                console.log('smsItemsNotif :', smsItemsNotif.result.body);

                                // Prepare the chart data
                                this._prepareDetailedGraphData(smsItemsMsg.result.body, smsItemsRdv.result.body, smsItemsNotif.result.body, [min_x_axis, max_x_axis]);
                                this._prepareDetailedSmsData(smsItemsMsg.result.body, smsItemsRdv.result.body, smsItemsNotif.result.body)

                            });

                    });
            });
    }
    private _prepareMapsData(x_axis_range: number[]) {
        let sucessMarkers = [];

        let searchMapParams = {
            index: 'sms.*',
            body: {
                "aggs": {
                    "distinct_data": {
                        "terms": { "field": "countryCode.keyword", "size": 500 },
                    }
                },
                "size": 0,
                "query": {
                    bool: {
                        must: []
                    }
                }
            }
        };

        let filter = [
            {
                "range": {
                    "timestamp": {
                        "gte": x_axis_range[0],
                        "lte": x_axis_range[1]
                    }
                }
            }
        ];

        searchMapParams.body.query.bool.must = filter;

        console.log('searchMapParams :', searchMapParams);

        searchMapParams.index = "sms.success";

        // Get the success data by country
        this._elasticAPI.search(searchMapParams)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((smsSuccessCountryCodeData: any) => {
                const successMapBucket = smsSuccessCountryCodeData.result.body.aggregations.distinct_data.buckets;

                console.log('Success Map Data :', successMapBucket);

                // success markers
                successMapBucket.forEach(element => {
                    let country = tableConvert.find(obj => {
                        return obj['"Alpha-2 code"'] === element.key;
                    });

                    console.log('country : ', country);

                    sucessMarkers.push({
                        country: country["\"Country\""], 
                        lat: Number(country["\"Latitude (average)\""]), 
                        long: Number(country["\"Longitude (average)\""]),
                        successCount: element.doc_count,
                        countryKey: element.key
                    });

                });

                this.markers = sucessMarkers;

                // Fails requete
                searchMapParams.index = "sms.fail";
                // Get the fails data by country
                this._elasticAPI.search(searchMapParams)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((smsFailCountryCodeData: any) => {
                        const failMapBucket = smsFailCountryCodeData.result.body.aggregations.distinct_data.buckets;

                        console.log('Fail Map Data :', failMapBucket);

                        // fail markers
                        failMapBucket.forEach(element => {
                            // We look for the country object that corresponds to the "Alpha-2 code" in the conversion table
                            let country = tableConvert.find(obj => {
                                return obj['"Alpha-2 code"'] === element.key;
                            });

                            // We look for the index of the country in the table, if = -1 then it is not there
                            let indexMarker = this.markers.findIndex(obj => obj.countryKey == element.key);

                            if (indexMarker !== -1) {
                                this.markers[indexMarker].failCount = element.doc_count;
                            } else {                                
                                this.markers.push({
                                    country: country["\"Country\""], 
                                    lat: Number(country["\"Latitude (average)\""]), 
                                    long: Number(country["\"Longitude (average)\""]),
                                    failCount: element.doc_count,
                                    countryKey: element.key
                                });
                            }
                        });
                        
                        console.log('all Markers: ', this.markers);
                    });
            });
    }
    private _prepareDetailedGraphData(smsItemsMsg: any, smsItemsRdv: any, smsItemsNotif: any, x_axis_range: number[], interval?: string) {


        let msgData = smsItemsMsg.aggregations.myDateHistogram.buckets.map(val => { return { x: new Date(val.key), y: val.doc_count } });
        let rdvData = smsItemsRdv.aggregations.myDateHistogram.buckets.map(val => { return { x: new Date(val.key), y: val.doc_count } });
        let notifData = smsItemsNotif.aggregations.myDateHistogram.buckets.map(val => { return { x: new Date(val.key), y: val.doc_count } });

        let currentDate = new Date();
        console.log(currentDate.getTime());
        console.log('msgData :', msgData);
        console.log('x_axis_range :', x_axis_range);

        let today = Date.now();

        console.info('interval => ', (interval ? interval : ''));

        // Config and data from the graph
        this.chartSmsByItemType = {
            series: [
                {
                    name: 'Message ' + (interval ? interval : ''),
                    data: msgData,
                    color: '#164a9e'
                },
                {
                    name: 'Rdv ' + (interval ? interval : ''),
                    data: rdvData,
                    color: '#1d67de'
                },
                {
                    name: 'Notification ' + (interval ? interval : ''),
                    data: notifData,
                    color: '#428bff'
                },
            ],

            chart: {
                id: 'smsByTypeChart',
                height: 300,
                stacked: true,
                type: "area",
                zoom: {
                    type: "x",
                    enabled: true,
                    autoScaleYaxis: true
                },
                toolbar: {
                    autoSelected: "zoom"
                },

                events: {
                    zoomed: (chartContext, { xaxis, yaxis }) => {
                        console.log('user zoomed => ', chartContext, { xaxis, yaxis });
                        console.log('x_axis_range => ', x_axis_range);
                        if (xaxis.min < x_axis_range[0] || xaxis.max > x_axis_range[1]) {// si dézoom en dehors du range
                            console.log('on est dans le IF !!');
                            this._searchAndDisplay(xaxis);
                        } else {
                            console.log('on n\'est dans le else !!');
                        }

                    }
                }
            },
            title: {
                text: "Nombre de sms envoyés"
            },
            xaxis: {
                type: 'datetime'
            },
        };

        this.chartSmsByItemType.dataLabels = {
            enabled: false
        };

        this.chartSmsByItemType.fill = {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.5,
              opacityTo: 0,
              stops: [0, 90, 100]
            }
          };

        this._isLoaded2 = true;
        console.log('chartSmsByItemType -> ', this.chartSmsByItemType);

        // Here we prepare the display of the 3rd graph (donut)
        this.chartSmsStats = {
            series: [
                smsItemsRdv.hits.total.value,
                smsItemsNotif.hits.total.value,
                smsItemsMsg.hits.total.value
            ],
            labels: ['Rdv', 'Notifications', 'Messages'],
            chart: {
                type: 'donut'
            },
            plotOptions: {
                pie: {
                    customScale: 1.08,
                    donut: {
                        size: '35%'
                    }
                }
            }
        }

        this._isLoaded3 = true;

    }


    private _filter(value: any, list: any[]): string[] {
        console.log('_filter value :', value);
        let filterValue;
        let valueToReturn;

        if (typeof value !== "string")
            value = value.toString();


        if (typeof value === "string") {
            filterValue = value.toLowerCase();
            valueToReturn = list.filter(option => {
                return option.toLowerCase().includes(filterValue);
            }
            );
        } else {
            filterValue = value;
            valueToReturn = list.filter(option => option.includes(filterValue));
        }

        return valueToReturn;
    }

    

}