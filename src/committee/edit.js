/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import {__} from '@wordpress/i18n';


import {useBlockProps, InspectorControls} from '@wordpress/block-editor';
import {SelectControl, Spinner, PanelBody} from '@wordpress/components';
import {__experimentalUseEntityRecords} from '@wordpress/core-data';
import {decodeEntities} from '@wordpress/html-entities';

import './editor.scss';
import {Member} from "../common";

export default function Edit({attributes, setAttributes}) {
	console.log(attributes);
	const {committee_id} = attributes;

	const {records: committees, hasResolved: committeesLoaded} = __experimentalUseEntityRecords('taxonomy', 'npseudo_team');
	const {records: committee, hasResolved: committeeLoaded} = __experimentalUseEntityRecords('postType', 'npseudo_com_member', {
		'npseudo_team': committee_id,
		_embed: 'wp:featuredmedia',
		context: 'view',
		'orderby': 'menu_order',
		'order': 'asc',
	});

	const content = committeeLoaded ? (
		committee.length > 0 ?
			committee.map((m) => <div key={m.id}><Member member={m} className="npseudo-card"/></div>)
			: <p>No Members Found.</p>
	): <Spinner />;

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					{committeesLoaded &&
					<SelectControl
						label="Select Control"
						value={ committee_id }
						options={ [
							{ value: 0, label: '- Select a Committee -', disabled:true},
							...committees.map((c) => ({value: c.id, label: c.name}))
						] }
						onChange={ (v) => setAttributes({committee_id: parseInt(v)}) }
					/>}
				</PanelBody>
			</InspectorControls>
			{content}
		</div>
	)
}
