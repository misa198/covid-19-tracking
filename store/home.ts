import Vue from 'vue';
import { ActionContext } from 'vuex/types';
import { RootState } from '.';
import {
  fetchKompaVietNamCases,
  KompaVietnamCasesResponse,
} from '~/services/kompa.service';

interface TrendingLineCasesData {
  date: string;
  confirmed: number;
  recovered: number;
  deaths: number;
}

interface ProvinceCasesData {
  confirmed: number;
  deaths: number;
  recovered: number;
  provinceId: string;
  provinceName: string;
}

export interface HomeState {
  trendingLineCases: {
    data: TrendingLineCasesData[];
    loading: boolean;
    error: boolean;
  };
  provinceCases: {
    data: ProvinceCasesData[];
  };
}

export const state: () => HomeState = () => ({
  trendingLineCases: {
    data: [],
    loading: false,
    error: false,
  },
  provinceCases: {
    data: [],
  },
});

export const mutations = {
  fetchVietnamCasesDataPending(state: HomeState) {
    Vue.set(state.trendingLineCases, 'loading', true);
    Vue.set(state.trendingLineCases, 'error', false);
  },
  fetchVietnamCasesDataFulfilled(
    state: HomeState,
    payload: KompaVietnamCasesResponse
  ) {
    const trendingLineCasesRes: TrendingLineCasesData[] = [];
    payload.data.trendlineVnCases.forEach((item) => {
      trendingLineCasesRes.push({
        date: `${item.date.slice(6, 8)}-${item.date.slice(
          4,
          6
        )}-${item.date.slice(0, 4)}`,
        confirmed: parseInt(item.confirmed, 10),
        recovered: parseInt(item.recovered, 10),
        deaths: parseInt(item.deaths, 10),
      });
    });
    const provinceCasesRes: ProvinceCasesData[] = [];
    payload.data.provinces.forEach((province) => {
      provinceCasesRes.push({
        confirmed: parseInt(province.Confirmed, 10),
        deaths: parseInt(province.Deaths, 10),
        recovered: parseInt(province.Recovered, 10),
        provinceId: province.Province_Id,
        provinceName: province.Province_Name,
      });
    });
    Vue.set(state.trendingLineCases, 'data', trendingLineCasesRes);
    Vue.set(state.provinceCases, 'data', provinceCasesRes);
    Vue.set(state.trendingLineCases, 'loading', false);
  },
  fetchVietnamCasesDataRejected(state: HomeState) {
    Vue.set(state.trendingLineCases, 'loading', false);
    Vue.set(state.trendingLineCases, 'error', true);
  },
};

export const actions = {
  async fetchVietnamTrendingLineCasesData({
    commit,
  }: ActionContext<HomeState, RootState>) {
    commit('fetchVietnamCasesDataPending');
    try {
      const res = await fetchKompaVietNamCases();
      commit('fetchVietnamCasesDataFulfilled', res);
    } catch (e) {
      commit('fetchVietnamCasesDataRejected');
    }
  },
};
