<?php

/**
 * classe generica per l'interazione con Doctrine dai DirectStore
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberDb
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action db
 */
class lsLabberDbActions extends sfActions
{
  /**
   * Salva una modifica su un record
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeUpdate(sfWebRequest $request)
  {
    try
    {

      if (!$class = $request->getParameter('doctrineClass'))
        throw new Exception('Missing \'doctrineClass\' parameter');
      if (!$data = $request->getParameter('data'))
        throw new Exception('Missing \'data\' parameter');

      /**
       * Se sono state modificate piu' righe lo store mi manda un array di
       * oggetti contenenti l'id della riga modificata e tutti i campi
       * modificati.
       * Se e' stata modificata una sola riga mi manda invece direttamente
       * un oggetto.
       */

      // recupero la chiave primaria dell'oggetto doctrine
      $table = Doctrine::getTable($class);
      $tableKey = $table->getIdentifier();

      // faccio in modo che $storeRecords sia un array
      (is_array($data)) ? $storeRecords = $data : $storeRecords[] = $data;

      // per ogni record dello store salvo le modifiche sul db
      foreach ($storeRecords as $storeRecordObj)
      {
        // converto in array, e' piu' comodo
        $storeRecord = (array) $storeRecordObj;

        // Se la tabella contiene una chiave composta
        if (is_array($tableKey)) {
          $keys = array();
          // mi costruisco l'array di valori per effettuare la find
          foreach ($tableKey as $key)
          {
            $keys[$key] = $storeRecord[$key];
            unset($storeRecord[$key]);
          }
          $doctrineRecord = $table->find($keys);
        } else {
          // altrimenti cerco direttamente il record con quel campo chiave
          $doctrineRecord = $table->find($storeRecord[$tableKey]);
          unset($storeRecord[$tableKey]);
        }

        // per ogni parametro vado a salvare il nuovo valore
        foreach (array_keys($storeRecord) as $parameterName)
        {
          // HACK altrimenti le ricerche per campo vuoto nelle combobox non fungono
          if ($storeRecord[$parameterName] === '')
            $storeRecord[$parameterName] = null;

          $doctrineRecord->$parameterName = $storeRecord[$parameterName];
        }
        $doctrineRecord->save();
      }

      // costisco il risultato direct
      $result = array(
              'success' => true,
              'data' => array()
      );
    }

    catch (Exception $e)
    {
      $result = array(
              'success' => false,
              'message' => $e->getMessage(),
              'file'    => $e->getFile(),
              'line'    => $e->getLine(),
              'trace'   => $e->getTrace()
      );
    }

    // Ritorno standard di dsExtDirectPlugin
    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Crea un nuovo record
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeCreate(sfWebRequest $request)
  {
    try
    {
      if (!$class = $request->getParameter('doctrineClass'))
        throw new Exception('Missing \'doctrineClass\' parameter');

      // La create proveniente da un EditorGridPanel avrà 'data' vuoto
      $data = (array) $request->getParameter('data');

      $doctrineObject = new $class();
      foreach ($data as $k => $v)
      {
        // Ext manda stringhe vuote per i field vuoti, ma i DB supportano null
        if ($v === '')
        {
          $v = null;
        }
        $doctrineObject->set($k, $v);
      }
      $doctrineObject->save();

      // costruisco il risultato direct
      $result = array(
        'success' => true,
        'data' => $doctrineObject->identifier()
      );
    }
    catch (Exception $e)
    {
      $result = array(
              'success' => false,
              'message' => $e->getMessage(),
              'file'    => $e->getFile(),
              'line'    => $e->getLine(),
              'trace'   => $e->getTrace()
      );
    }

    // Ritorno standard di dsExtDirectPlugin
    $this->result = $result;
    return sfView::SUCCESS;
  }


  /**
   * Elimina un record
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeDestroy(sfWebRequest $request)
  {
    try
    {
      if (!$class = $request->getParameter('doctrineClass'))
      {
        throw new Exception('Missing \'doctrineClass\' parameter');
      }

      if (!$data = $request->getParameter('data'))
      {
        throw new Exception('Missing \'data\' parameter');
      }

      $success = Doctrine::getTable($class)->find($data)->delete();

      if (!$success)
      {
        throw new Exception('DELETE FAIL!');
      }

      $result = array(
        'success' => true,
        'data'    => array(),
      );
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
        'trace'   => $e->getTrace()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Legge dei record
   *
   *   doctrineClass: 'Class'
   *
   *   doctrineJoins: [
   *     'Class.OtherClass',
   *     'Class.FooClass',
   *     'Class.AnotherClass.Foo.YetAnotherClass'
   *   ]
   *
   *   doctrineWhereIns: [
   *     {
   *       field: 'id',
   *       valueSet: [34,45]
   *     }
   *   ]
   *
   *   doctrineWheres: [
   *     {
   *       field: 'Sample.bozza',
   *       operator: '=',
   *       value: false
   *     }
   *   ]
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeList(sfWebRequest $request)
  {
    try
    {
      // query base
      if (!$class = $request->getParameter('doctrineClass'))
        throw new Exception('Missing \'doctrineClass\' parameter');
      $query = Doctrine_Query::create()->from($class);

      // joins
      if ($request->hasParameter('doctrineJoins'))
      {
        $joins = $request->getParameter('doctrineJoins');
        foreach ($joins as $join)
        {
          $query->leftJoin($join);
        }
      }

      // wheres
      if ($request->hasParameter('doctrineWheres'))
      {
        $wheres = $request->getParameter('doctrineWheres');
        foreach ($wheres as $i => $where)
        {
          $query->andWhere($class.'.'.$where->field.' '.$where->operator.' '.$where->value);
        }
      }

      // whereIn
      if ($request->hasParameter('doctrineWhereIns'))
      {
        $whereIns = $wheres = $request->getParameter('doctrineWhereIns');
        foreach ($whereIns as $i => $whereIn)
        {
          $query->andWhereIn( $class.'.'.$whereIn->field,
                  $whereIn->valueSet);
        }
      }

      // sorter
      if ($request->hasParameter('sort'))
      {
        $column = $request->getParameter('sort', 'id');
        $dir = $request->getParameter('dir', 'ASC');
        $query->orderBy(
                sprintf(
                '%s.%s %s',
                $class,
                Doctrine::getTable($class)->getFieldName($column),
                $dir
                )
        );
      }

      // query per le ComboBox
      if ($request->hasParameter('query') && $request->getParameter('query') != '')
      {
        if ($request->hasParameter('searchFields'))
        {
          $searchFields = $request->getParameter('searchFields');
          $queryString = '1 AND (%1$s.%2$s REGEXP \'%4$s\' OR %1$s.%3$s REGEXP \'%4$s\')';
          $query->andWhere(sprintf($queryString, $class, $searchFields[0], $searchFields[1], $request->getParameter('query')));
        }
        else
        {
          $displayField = $request->getParameter('displayField', 'name');
          $query->andWhere($class.'.'.$displayField.' REGEXP ?', $request->getParameter('query'));
        }
      }

      // FilterFields e FilteringToolbar
      if ($request->hasParameter('filters'))
      {
        $filters = $request->getParameter('filters');
        foreach ($filters as $filter)
        {
          $query->andWhere(sprintf('%s.%s %s ?', $class, $filter->field, $filter->operator), $filter->value);
        }
      }

      // Ext.ux.grid.GridFilters
      if ($request->hasParameter('filter'))
      {
        $filters = json_decode($request->getParameter('filter'));

        # code resposible for filtering data
        foreach($filters as $filter)
        {
          # comparison condition
          if (isset($filter->comparison))
          {
            switch ($filter->comparison)
            {
              case 'eq':
                $comparison = '=';
                break;
              case 'lt':
                $comparison = '<';
                break;
              case 'gt':
                $comparison = '>';
                break;
            }
          }

          # switch 5 filter types
          switch ($filter->type)
          {
            case 'boolean':
              $query->addWhere(sprintf('%s.%s = ?', $class, $filter->field), $filter->value);
              break;
            case 'string':
              $query->addWhere(sprintf('%s.%s LIKE ?', $class, $filter->field), '%'.$filter->value.'%');
              break;
            case 'numeric':
              $query->addWhere(sprintf('%s.%s %s ?', $class, $filter->field, $comparison), $filter->value);
              break;
            case 'list':
              $query->whereIn(sprintf('%s.%s', $class, $filter->field), explode(',', $filter->value));
              break;
            case 'date':
              if ($comparison != '=')
              {
                $query->addWhere(sprintf('%s.%s %s ?', $class, $filter->field, $comparison), date('Y-m-d', strtotime($filter->value)));
              }
              else
              {
                $query->andWhere(sprintf('%s.%s > ?', $class, $filter->field), date('Y-m-d', strtotime($filter->value)));
                $query->andWhere(sprintf('%s.%s < ?', $class, $filter->field), date('Y-m-d', strtotime($filter->value) + 86400));
              }
              break;
            default:
              break;
          }
        }
      }

      // GROUP BY
      if ($request->hasParameter('groupby'))
      {
        $query->groupBy($request->getParameter('groupby'));
      }

      // tableMethod
      if ($request->hasParameter('tableMethod'))
      {
        $tableMethod = $request->getParameter('tableMethod');
        $param = $request->getParameter('tableMethodParam', null);
        $query = Doctrine::getTable($class)->$tableMethod($query, $param);
      }

      // Filtro oggetti non confermati
      if (Doctrine::getTable($class)->hasField('unconfirmed') && !$this->getUser()->hasPermission('controlli'))
      {
        $query->andWhere('unconfirmed = 0');
      }

      // paginatore
      if ($request->hasParameter('limit'))
      {
        $limit = $request->getParameter('limit', null);
        $page = $request->hasParameter('start') ?
                $request->getParameter('start')/$limit+1 :
                1;
        $pager = new sfDoctrinePager($class, $limit);
        $pager->setQuery($query);
        $pager->setPage($page);
        $pager->init();
      }

      // eseguo la query
      if (isset ($pager))
      {
        $result = array(
          'total'   => $pager->getNbResults(),
          'page'    => $page,
          'data'    => $pager->getResults(Doctrine_Core::HYDRATE_ARRAY),
          'success' => true,
        );
      }
      else
      {
        $result = array(
          'data'    => $query->fetchArray(),
          'success' => true
        );
      }

      if ($request->hasParameter('timeFormat'))
      {
        $timeFormat = $request->getParameter('timeFormat');

        $d = $result['data'];
        $fields = Doctrine_Core::getTable($class)->getColumnNames();
        foreach ($fields as $field)
        {
          if (Doctrine_Core::getTable($class)->getTypeOf($field) == 'time')
          {
            foreach ($result['data'] as &$record)
            {
              $record[$field] = substr($record[$field], 0, 5);
            }
          }
        }
      }

      // metaData per JsonReader
      if ($request->getParameter('metaData') === true)
      {
        $result['metaData'] = array(
          'fields'        => Doctrine_Core::getTable($class)->getColumnNames(),
          'idProperty'    => Doctrine_Core::getTable($class)->getIdentifier(),
          'root'          => 'data',
          'totalProperty' => 'total'
        );
      }
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
        'trace'   => $e->getTrace()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Recupera i valori per un field di tipo enum
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeGetEnumValues()
  {
    $table = $this->getRequestParameter('table');
    $fieldName = $this->getRequestParameter('field');

    $array = Doctrine_Core::getTable($table)->getEnumValues($fieldName);
    $enums = array();

    foreach ($array as $enum)
    {
      $enums[] = (array) $enum;
    }

    $this->result = $enums;
    return sfView::SUCCESS;
  }

  
}
