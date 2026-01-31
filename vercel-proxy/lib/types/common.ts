/** Seoul Open API 공통 결과 코드 */
export interface SeoulApiResult {
  CODE: string; // 'INFO-000': 정상, 'INFO-200': 데이터 없음
  MESSAGE: string;
}
