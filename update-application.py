#!/usr/bin/env python
#coding=utf-8
from bs4 import BeautifulSoup
import urllib2
import json

main_json = '{ "linhas":['

##funcoes
def readAll(meio_transporte, n):
  global main_json
  
  id, numero, nome, sentido, link, mapa, itinerario, horarios, obs = '','','','','','','','',''
  url = 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=p&opcao=1&txt='
  resp = urllib2.urlopen(url).read()
  data = resp.decode('utf-8') #peguei o html
  #peguei o indice de onde começa a table do bus
  data = data[data.find(meio_transporte):]
  #peguei o indice final da lista de bus
  data = data[0:data.find('</table>') + 8]
  # a variavel data só tem como conteúdo a table dos onibus
  soup = BeautifulSoup(data)
  #com o código a seguir eu consegui pegar todas os números das linhas de onibus
  col = 1
  n_vezes = 0
  for table_row in soup.findAll('tr'):
    if '#26508C' in table_row['style']: 
      n_vezes += 1
      continue
    elif n_vezes > n: break
    n_vezes += 1
    for row_column in table_row.findAll('td'):
      if col == 1: numero = row_column.text
      elif col == 2: nome = row_column.text
      elif col == 3: sentido = row_column.text
      elif col == 4:
        for anchor in row_column.findAll('a'):
          link = anchor['href']          
      elif col == 5:
        for anchor in row_column.findAll('a'):
          mapa = getMapa(anchor['href'])
          id = numero + " - " + nome
          col = 1
        infos = getInfos(link)
        itinerario = infos[0]
        itinerario = itinerario
        obs = infos[1]
        horarios = infos[2]
        main_json += buildJson(id.replace('–','-'), numero, nome.replace('–','-'), sentido.replace('–','-'), itinerario.replace('–','-'), obs.replace('–','-'), mapa, horarios) + ','
        break
      col = col + 1
      
  
  #print '-----------------------------------------------------'
  #print 'ID: ' + id
  #print 'Numero: ' + numero 
  #print 'Nome: ' + nome
  #print 'Sentido: ' + sentido
  #print 'Itinerario: '
  #for iti in itinerario.replace(' – ','**').split('**'):
  #  print iti
  #print 'Observacao: ' + obs
  #print 'Link do GMaps: ' + mapa
  #print 'Horarios: '
  #for horario in horarios:
  #  horario = horario.split('**')
  #  for hora in horario:
  #    print hora
  #print '-----------------------------------------------------\n'
  
def getMapa(link_mapa):
  url = 'http://www.sjc.sp.gov.br' + link_mapa
  resp = urllib2.urlopen(url).read()
  data = resp.decode('utf-8') #peguei o html
  #peguei o indice de onde começa a table do bus
  data = data[data.find('<div style="margin-top: 10px;margin-bottom: 10px;">'):]
  #peguei o indice final da lista de bus
  data = data[0:data.find('</div>') + 6]
  # a variavel data só tem como conteúdo a table dos onibus
  soup = BeautifulSoup(data)
  
  if 'iframe' in data:  
    for iframe in soup.findAll('iframe'):
      return iframe.attrs['src']
  else:
    print data
  return 'Sem mapa.'
def getInfos(link_linha):
  url = 'http://www.sjc.sp.gov.br' + link_linha
  tabela_infos, obs, horarios = '','',''
  retorno = []
  resp = urllib2.urlopen(url).read()
  data = resp.decode('utf-8') #peguei o html
  ##
  tabela_infos = data[data.find('<table width="100%" border="0" align="center" cellpadding="2" cellspacing="0">'):]
  tabela_infos = tabela_infos[0:tabela_infos.find('</table>') + 8]
  ##
  horarios = data[data.find('''<span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblResultado" class="textosm">'''):]
  horarios = horarios[0:horarios.find('</span>') + 7]
  ##
  #pegar o itinerario
  s_infos = BeautifulSoup(tabela_infos)
  
  i_linha = 1
  for table_row in s_infos.findAll('tr'):
    if i_linha == 4:
      for table_column in table_row.findAll('td'):
        if '<strong>' not in table_column.text:
          for span in table_column.findAll('span'):
            retorno.append(span.text.encode('utf-8').replace(' – ','**'))
    elif i_linha == 5:
      for table_column in table_row.findAll('td'):
        if '<strong>' not in table_column.text:
          for span in table_column.findAll('span'):
            retorno.append(span.text.encode('utf-8'))
          
    i_linha += 1
    
  #horarios
  s_h = BeautifulSoup(horarios)
  lista_horarios = []
  for table in s_h.findAll('table'):
    if not table.has_attr('style'):
      cont_row = 1
      h = ''
      for tabela_h in table.findAll('table'):
        for tr in tabela_h.findAll('tr'):
          if cont_row == 1:
            for td in tr.findAll('td'):
              for b in td.findAll('b'):
                h += b.text + '**'
          elif cont_row > 2:
            for td in tr.findAll('td'):
              h += td.text + '**'
          cont_row += 1
        lista_horarios.append(h)
        h = ''
  
  retorno.append(lista_horarios)
  return retorno 
  
###### inicio do código
def buildJson(id, numero, nome, sentido, itinerario, obs, mapa, horarios):
  ##montando o json
  retorno_em_json = '{'
  retorno_em_json += '"id":"' + id + '",'
  retorno_em_json += '"numero":"' + numero + '",'
  retorno_em_json += '"nome":"' + nome + '",'
  retorno_em_json += '"sentido":"' + sentido + '",'
  retorno_em_json += '"itinerario":"' + itinerario.decode('utf-8') + '",'
  retorno_em_json += '"obs":"' + obs.decode('utf-8') + '",'
  retorno_em_json += '"gmaps":"' + mapa + '",'
  retorno_em_json += '"horarios": ['
  for horario in horarios:
    retorno_em_json += '{"horario":"' + horario + '"},'
  retorno_em_json = retorno_em_json[0:len(retorno_em_json) - 1] + ']}'
  return retorno_em_json
  

onibus = '<table class="textosm" cellspacing="2" cellpadding="4" border="0" id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista" style="background-color:White;border-color:White;border-width:0px;font-size:12px;font-weight:normal;font-style:normal;text-decoration:none;width:100%;">'

alternativo = '<table class="textosm" cellspacing="2" cellpadding="4" border="0" id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo" style="background-color:White;border-color:White;border-width:0px;font-size:12px;font-weight:normal;font-style:normal;text-decoration:none;width:100%;">'

readAll(onibus, 20)

#with open('linhas.txt', 'w') as txt:
#  txt.write(main_json.decode('utf-8'))
#  txt.close

main_json = main_json[:- 1] + ']}'
main_json = json.loads(main_json)

with open('linhas.json', 'w') as outfile:
    json.dump(main_json, outfile)
    outfile.close()
print 'Arquivo gerado com sucesso!'