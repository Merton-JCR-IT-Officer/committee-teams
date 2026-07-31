/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import {__} from '@wordpress/i18n';


import {useBlockProps, BlockControls} from '@wordpress/block-editor';
import {Placeholder, ComboboxControl, SelectControl, Spinner, Icon, ToolbarButton} from '@wordpress/components';
import {withSelect, useSelect} from '@wordpress/data';
import {store as coreDataStore} from '@wordpress/core-data';
import {decodeEntities} from '@wordpress/html-entities';
import {forwardRef} from '@wordpress/element';

import './editor.scss';
import {Member, PersonIcon} from "../common";

function MemberSelect({onSelect}) {
	const {members, hasResolved} = useSelect(
		(select) => {
			const selectorArgs = ['postType', 'npseudo_com_member', { per_page: 50 }];
			return {
				members: select(coreDataStore).getEntityRecords(
					...selectorArgs
				),
				hasResolved: select(coreDataStore).hasFinishedResolution(
					'getEntityRecords',
					selectorArgs
				),
			};
		},
		[]
	);

	const content = hasResolved ?
		<ComboboxControl
			label={__('Select Member', 'committee_teams')}
			onChange={onSelect}
			options={[
			...members.map((member) => ({value: member.id, label: decodeEntities(member.title.rendered)}))]}
		/>
		: <Spinner/>
	return (
		<Placeholder
			icon={<Icon icon={PersonIcon}/>}
			label={__('Committee Member', 'committee_teams')}
		>
			{content}
		</Placeholder>
	);
}

const MemberFetcher = forwardRef(({member_id, ...props}, ref) => {
	const {member, hasResolved} = useSelect((select) => {
		const {getEntityRecord, hasFinishedResolution} = select(coreDataStore);

		const selectorArgs = ['postType', 'npseudo_com_member', member_id, {_embed: 'wp:featuredmedia', context: 'view'}];
		return {
			member: getEntityRecord(...selectorArgs),
			hasResolved: hasFinishedResolution('getEntityRecord', selectorArgs),
		};
	}, [member_id]);
	return hasResolved ? <Member ref={ref} {...props} member={member} />: <div {...props}><Spinner /></div>;
})

export default function Edit({attributes, setAttributes, className}) {
	const onChangeMember = (member_id) => {
		setAttributes({member_id: parseInt(member_id)})
	};

	if (!attributes.member_id || attributes.member_id === -1) {
		return (<div {...useBlockProps()}>
			<BlockControls>
				<ToolbarButton onClick={() => setAttributes({member_id: null})}>Replace</ToolbarButton>
			</BlockControls>
			<MemberSelect onSelect={onChangeMember}/>
		</div>);
	} else {
		return (<MemberFetcher {...useBlockProps()} member_id={attributes.member_id}>
			<BlockControls>
				<ToolbarButton onClick={() => setAttributes({member_id: null})}>Replace</ToolbarButton>
			</BlockControls>
		</MemberFetcher>);
	}
}
