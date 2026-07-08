<?php

/**
 * Plugin Name:       Committee Teams
 * Description:       Add profiles for every member of committees.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.2.7
 * Author:            Joe Bell
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       committee-teams
 *
 * @package           NpseudoCommitteeTeams
 */

const NPSEUDO_VERSION = '0.2.6';
const NPSEUDO_POST_TYPE_NAME = 'npseudo_com_member';
const NPSEUDO_TEAM_CAT_NAME = 'npseudo_team';
const NPSEUDO_TDOMAIN = 'committee_teams';
const NPSEUDO_META_PRONOUNS = 'member_pronouns';
const NPSEUDO_META_EMAIL = 'member_email';
const NPSEUDO_META_INSTAGRAM = 'member_instagram';
const NPSEUDO_META_POSITION = 'position';
const NPSEUDO_META_ATTACHMENT = 'attachment';


function npseudo_committee_teams_register_meta()
{
	register_post_meta(NPSEUDO_POST_TYPE_NAME, NPSEUDO_META_EMAIL, array(
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	));

	register_post_meta(NPSEUDO_POST_TYPE_NAME, NPSEUDO_META_PRONOUNS, array(
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	));

	register_post_meta(NPSEUDO_POST_TYPE_NAME, NPSEUDO_META_POSITION, array(
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	));

	register_post_meta(NPSEUDO_POST_TYPE_NAME, NPSEUDO_META_INSTAGRAM, array(
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	));

	register_post_meta(NPSEUDO_POST_TYPE_NAME, NPSEUDO_META_ATTACHMENT, array(
		'show_in_rest' => array(
			'schema' => array(
				'type' => 'object',
				'properties' => array(
					'id' => array('type' => 'integer'),
					'url' => array('type' => 'string', 'format' => 'uri'),
					'title' => array('type' => 'string'),
				),
			)
		),
		'single' => true,
		'type' => 'object',

	));
}

function npseudo_render_member_content($member_attrs)
{
	$str = '';
	if (isset($member_attrs['thumb'])) {
		$str .= $member_attrs['thumb'];
	}
	$str .= sprintf('<div class="npseudo-card-body"><h5>%s</h5>', $member_attrs['title']);

	if ($member_attrs['pronouns'] != '') {
		$str .= sprintf('<span class="npseudo-pronouns">%s</span>', $member_attrs['pronouns']);
	}

	$insta_link = '';

	if ($member_attrs['instagram'] != '') {
		$insta_link .= sprintf(
			// TODO: don't hard-code the image URL
			'<a href="https://instagram.com/%s/"><img src="/wp-content/plugins/committee-teams/public/instagram-logo.svg" alt="Instagram logo" class="instagram-logo" /></a>',
			$member_attrs['instagram'],
		);
	}

	$str .= sprintf('<h6>%s %s</h6>', $member_attrs['position'], $insta_link);

	if ($member_attrs['email'] != '') {
		$str .= sprintf('<a href="mailto:%s">Email Me</a>', $member_attrs['email']);
	}

	if (isset($member_attrs['manifesto'])) {
		$str .= sprintf('<a href="%s">Manifesto</a>', $member_attrs['manifesto']);
	}

	if (trim(strip_tags($member_attrs['content'])) != '') {
		$str .= sprintf(
			'<a href="#" id="npseudo-info-toggle-%1$d" role="button" aria-expanded="false" aria-controls="npseudo-info-%1$d" data-more-info>More Info</a><section class="npseudo-member-bio" id="npseudo-info-%1$d" aria-labelledby="npseudo-info-toggle-%1$d" hidden>%2$s</section>',
			$member_attrs['ID'],
			$member_attrs['content']
		);
	}

	$str .= '</div>';

	return $str;
}

function npseudo_committee_teams_render_member($block_attributes, $content)
{
	wp_enqueue_script('npseudo_member_script', plugins_url('public/js/info-toggle.js', __FILE__), array(), '1.0.0', true);
	if ($block_attributes['member_id'] <= 0) {
		return '';
	}
	$post = get_post($block_attributes['member_id']);
	if (!$post || $post->post_type != NPSEUDO_POST_TYPE_NAME) {
		return '';
	}
	$member_attrs = array(
		'ID' => $post->ID,
		'email' => get_post_meta($post->ID, NPSEUDO_META_EMAIL, true),
		'pronouns' => get_post_meta($post->ID, NPSEUDO_META_PRONOUNS, true),
		'position' => get_post_meta($post->ID, NPSEUDO_META_POSITION, true),
		'title' => get_the_title($post),
		'content' => apply_filters('the_content', $post->post_content),
		'instagram' => get_post_meta($post->ID, NPSEUDO_META_INSTAGRAM, true)
	);

	$manifesto_details = get_post_meta($post->ID, NPSEUDO_META_ATTACHMENT, true);
	if (isset($manifesto_details['url'])) {
		$member_attrs['manifesto'] = $manifesto_details['url'];
	}

	if (has_post_thumbnail($post)) {
		$member_attrs['thumb'] = get_the_post_thumbnail($post, 'medium');
	}

	return sprintf('<div %s>%s</div>', get_block_wrapper_attributes(), npseudo_render_member_content($member_attrs));
}

function npseudo_committee_teams_render_committee($block_attributes, $content)
{
	wp_enqueue_script('npseudo_member_script', plugins_url('public/js/info-toggle.js', __FILE__), array(), '1.0.1', true);
	global $post;
	$the_query = new WP_Query(array(
		'post_type' => NPSEUDO_POST_TYPE_NAME,
		'posts_per_page' => -1,
		'tax_query' => array(
			array(
				'taxonomy' => NPSEUDO_TEAM_CAT_NAME,
				'terms' => $block_attributes['committee_id'],
			),
		),
		'orderby' => 'menu_order',
		'order' => 'ASC',
	));
	$str = '';
	// The Loop
	if ($the_query->have_posts()) {
		$str = '<div ' . get_block_wrapper_attributes() . '/>';
		while ($the_query->have_posts()) {
			$the_query->the_post();
			$member_attrs = array(
				'ID' => $post->ID,
				'email' => get_post_meta($post->ID, NPSEUDO_META_EMAIL, true),
				'pronouns' => get_post_meta($post->ID, NPSEUDO_META_PRONOUNS, true),
				'position' => get_post_meta($post->ID, NPSEUDO_META_POSITION, true),
				'title' => get_the_title($post),
				'content' => apply_filters('the_content', $post->post_content),
				'instagram' => get_post_meta($post->ID, NPSEUDO_META_INSTAGRAM, true)
			);

			$manifesto_details = get_post_meta($post->ID, NPSEUDO_META_ATTACHMENT, true);
			if (isset($manifesto_details['url'])) {
				$member_attrs['manifesto'] = $manifesto_details['url'];
			}

			if (has_post_thumbnail($post)) {
				$member_attrs['thumb'] = get_the_post_thumbnail($post, 'medium');
			}
			$str .= sprintf('<div class="npseudo-card">%s</div>', npseudo_render_member_content($member_attrs));
		}
		$str .= '</div>';
	} else {
		$str = '<p>No Committee Members Found.</p>';
	}
	/* Restore original Post Data */
	wp_reset_postdata();
	return $str;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function npseudo_committee_teams_blocks_init()
{
	register_post_type(
		NPSEUDO_POST_TYPE_NAME,
		array(
			'labels' => array(
				'name' => __('Committee Members', NPSEUDO_TDOMAIN),
				'singular_name' => __('Committee Member', NPSEUDO_TDOMAIN),
				'add_new_item' => __('Add new member', NPSEUDO_TDOMAIN),
				'new_item' => __('New member', NPSEUDO_TDOMAIN),
				'view_item' => __('View member', NPSEUDO_TDOMAIN),
				'not_found' => __('No members found', NPSEUDO_TDOMAIN),
				'not_found_in_trash' => __('No members found in trash', NPSEUDO_TDOMAIN),
				'all_items' => __('All members', NPSEUDO_TDOMAIN),
				'insert_into_item' => __('Insert into member', NPSEUDO_TDOMAIN)
			),
			'description' => 'A member of a committee',
			'public' => false,
			'exclude_from_search' => true,
			'publicly_queryable' => false,
			'show_ui' => true,
			'show_in_menu' => true,
			'menu_position' => 25,
			'show_in_nav_menus' => true,
			'show_in_admin_bar' => true,
			'show_in_rest' => true,
			'menu-icon' => 'dashicons-businessperson',
			'supports' => array(
				'title',
				'editor',
				'thumbnail',
				'custom-fields',
				'page-attributes'
			),
			'template' => array(
				array(
					'core/paragraph',
					array(
						'placeholder' => 'Add Description...',
					)
				)
			),
			'rewrite' => ['slug' => 'member'],
			'template_lock' => 'all',
			'taxonomies' => [NPSEUDO_TEAM_CAT_NAME],
			'has_archive' => false,
		)
	);
	npseudo_committee_teams_register_meta();

	register_taxonomy(
		NPSEUDO_TEAM_CAT_NAME,
		[NPSEUDO_POST_TYPE_NAME],
		array(
			'hierarchical' => false,
			'rewrite' => ['slug' => 'committee'],
			'show_admin_column' => true,
			'show_in_rest' => true,
			'labels' => array(
				'name' => __('Committees', NPSEUDO_TDOMAIN),
				'singular_name' => __('Committee', NPSEUDO_TDOMAIN),
				'all_items' => __('All Committees', NPSEUDO_TDOMAIN),
				'edit_item' => __('Edit Committee', NPSEUDO_TDOMAIN),
				'view_item' => __('View Committee', NPSEUDO_TDOMAIN),
				'update_item' => __('Update Committee', NPSEUDO_TDOMAIN),
				'add_new_item' => __('Add New Committee', NPSEUDO_TDOMAIN),
				'new_item_name' => __('New Committee Name', NPSEUDO_TDOMAIN),
				'search_items' => __('Search Committees', NPSEUDO_TDOMAIN),
				'popular_items' => __('Popular Committees', NPSEUDO_TDOMAIN),
				'separate_items_with_commas' => __('Separate committees with comma', NPSEUDO_TDOMAIN),
				'choose_from_most_used' => __('Choose from most used Committees', NPSEUDO_TDOMAIN),
				'not_found' => __('No Committees found', NPSEUDO_TDOMAIN),
			)
		)
	);

	register_taxonomy_for_object_type(NPSEUDO_TEAM_CAT_NAME, NPSEUDO_POST_TYPE_NAME);

	register_block_type(__DIR__ . '/build/committee-member', [
		'render_callback' => 'npseudo_committee_teams_render_member'
	]);

	register_block_type(__DIR__ . '/build/committee', [
		'render_callback' => 'npseudo_committee_teams_render_committee'
	]);
}

add_action('init', 'npseudo_committee_teams_blocks_init');

add_action('enqueue_block_editor_assets', function () {
	$script_asset_path = __DIR__ . '/build/member-admin.asset.php';
	$script_asset = require($script_asset_path);
	$script_path = plugins_url('build/member-admin.js', __FILE__);
	wp_register_script('npseudo-member-meta-plugin', $script_path, $script_asset['dependencies'], $script_asset['version']);
	wp_enqueue_script('npseudo-member-meta-plugin');
});
