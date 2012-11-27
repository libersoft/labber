<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <?php include_http_metas() ?>
    <?php include_metas() ?>
    <?php include_title() ?>
    <link rel="shortcut icon" href="/favicon.ico" />
    <?php use_helper('sfCombine') ?>
    <?php include_combined_stylesheets() ?>
    <?php if (sfConfig::get('sf_environment') == 'prod'): ?>
      <?php use_javascript('ext/adapter/ext/ext-base.js', 'first') ?>
      <?php use_javascript('ext/ext-all.js', 'first') ?>
    <?php else: ?>
      <?php use_javascript('ext/adapter/ext/ext-base-debug.js', 'first') ?>
      <?php use_javascript('ext/ext-all-debug-w-comments.js', 'first') ?>
    <?php endif; ?>
    <?php use_javascript('ext/src/locale/ext-lang-it.js', 'first') ?>
    <?php use_javascript('ext-ux/panelCollapsedTitle.js', 'first') ?>
    <?php use_javascript('ext-ux/CheckTreePanel.js', 'first') ?>
    <?php use_javascript('ext-ux/DateTime.js', 'first') ?>
    <?php use_javascript('ext-ux/LocalStorageProvider.js', 'first') ?>
    <?php use_javascript('ext-ux/ClearableComboBox.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/CheckColumn.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/FieldLabeler.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/ItemSelector.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/MultiSelect.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/RowExpander.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/menu/RangeMenu.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/menu/ListMenu.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/GridFilters.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/Filter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/StringFilter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/DateFilter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/ListFilter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/NumericFilter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/gridfilters/filter/BooleanFilter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGrid.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGridColumnResizer.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGridColumns.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGridLoader.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGridNodeUI.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/treegrid/TreeGridSorter.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/fileuploadfield/FileUploadField.js', 'first') ?>
    <?php use_javascript('ext/examples/ux/statusbar/StatusBar.js', 'first') ?>
    <?php use_javascript('extdirect_api.js') ?>
    <?php include_combined_javascripts() ?>
  </head>
  <body>
    <?php echo $sf_content ?>
  </body>
</html>
